const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const googleSheets = require('../services/googleSheets');

const BOOKINGS_PATH = path.join(__dirname, '../data/bookings.json');
const CALCOM_API_URL = 'https://api.cal.com/v1';
const API_KEY = process.env.CALCOM_API_KEY;

const readJSON = (p) => {
    try {
        if (!fs.existsSync(p)) return [];
        let content = fs.readFileSync(p, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        if (!content.trim()) return [];
        return JSON.parse(content);
    } catch (e) {
        console.error(`[Bookings] Error reading ${p}:`, e.message);
        return [];
    }
};

const writeJSON = (p, d) => {
    try {
        fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error(`[Bookings] Error writing to ${p}:`, e.message);
        return false;
    }
};

/**
 * Fetch bookings from Cal.com
 */
async function fetchCalComBookings() {
    try {
        console.log('[Cal.com] Fetching bookings...');
        const response = await fetch(`${CALCOM_API_URL}/bookings?apiKey=${API_KEY}`);
        const data = await response.json();

        if (!data.bookings) {
            console.error('[Cal.com] Unexpected response structure:', data);
            return [];
        }

        // Map Cal.com data to our internal format
        return data.bookings.map(b => ({
            id: b.id.toString(),
            calComId: b.id,
            clientName: b.attendees[0]?.name || 'Unknown',
            email: b.attendees[0]?.email || '',
            mobile: b.attendees[0]?.phoneNumber || '', // Note: Cal.com might need custom field for mobile if not standard
            eventType: b.title || 'Session',
            date: b.startTime,
            endTime: b.endTime,
            status: b.status.toLowerCase(),
            rescheduleUrl: b.rescheduleUrl,
            cancelUrl: b.cancelUrl,
            notes: b.description || '',
            createdAt: b.createdAt || b.startTime,
            source: 'cal.com'
        }));
    } catch (error) {
        console.error('[Cal.com] API Error:', error.message);
        return [];
    }
}

// --- ROUTES ---

/**
 * Get Bookings (Read-only from Cal.com + Local Cache)
 */
router.get('/', async (req, res) => {
    const { sync } = req.query;
    let bookings = readJSON(BOOKINGS_PATH);

    if (sync === 'true' || bookings.length === 0) {
        const calBookings = await fetchCalComBookings();
        if (calBookings.length > 0) {
            bookings = calBookings;
            writeJSON(BOOKINGS_PATH, bookings);

            // Sync to Google Sheets if possible (Optional but requested)
            // We'll handle this in the webhook mainly, but sync here too if needed.
        }
    }

    res.json(bookings);
});

/**
 * Cal.com Webhook Handler
 * Listen for booking.created, booking.confirmed, etc.
 */
router.post('/webhook', async (req, res) => {
    const payload = req.body;
    const eventType = payload.triggerEvent; // 'BOOKING_CREATED', etc.
    const booking = payload.payload;

    console.log(`[Cal.com Webhook] Received ${eventType} for booking ${booking.id}`);

    try {
        const bookings = readJSON(BOOKINGS_PATH);

        // Transform the webhook payload
        const mobileField = booking.attendees[0]?.phoneNumber || ''; // Try to find mobile

        const mappedBooking = {
            id: booking.id.toString(),
            calComId: booking.id,
            clientName: booking.attendees[0]?.name || 'Unknown',
            email: booking.attendees[0]?.email || '',
            mobile: mobileField,
            eventType: booking.title || 'Session',
            date: booking.startTime,
            status: booking.status ? booking.status.toLowerCase() : 'confirmed',
            notes: booking.description || '',
            source: 'cal.com',
            updatedAt: new Date().toISOString()
        };

        const existingIdx = bookings.findIndex(b => b.id === mappedBooking.id);

        if (eventType === 'BOOKING_CANCELLED') {
            if (existingIdx > -1) bookings.splice(existingIdx, 1);
        } else {
            if (existingIdx > -1) {
                bookings[existingIdx] = { ...bookings[existingIdx], ...mappedBooking };
            } else {
                bookings.push(mappedBooking);
            }
        }

        writeJSON(BOOKINGS_PATH, bookings);

        // Sync to Google Sheets (Highly requested)
        // Note: You'll need to update your googleSheets service to handle these fields
        try {
            await googleSheets.postToSheet({
                ...mappedBooking,
                action: eventType === 'BOOKING_CANCELLED' ? 'deleteBooking' : 'addBooking'
            });
        } catch (syncErr) {
            console.error('[Webhook] Google Sheet sync failed:', syncErr.message);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[Cal.com Webhook] Error processing:', error.message);
        res.status(500).json({ error: 'Internal processing error' });
    }
});

/**
 * Get Event Types from Cal.com
 */
router.get('/event-types', async (req, res) => {
    try {
        const response = await fetch(`${CALCOM_API_URL}/event-types?apiKey=${API_KEY}`);
        const data = await response.json();

        if (!data.event_types) {
            return res.json([]);
        }

        // Return just the names for the dropdowns
        const types = data.event_types.map(t => t.title);
        res.json(types);
    } catch (error) {
        console.error('[Cal.com] Event Types Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch event types' });
    }
});

// All other custom routes (availability, manual block) are removed as requested.

module.exports = router;
