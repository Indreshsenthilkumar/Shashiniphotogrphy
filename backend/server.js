const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const vaultRoutes = require('./routes/vaults');
const bookingRoutes = require('./routes/bookings');
const cmsRoutes = require('./routes/cms');
const messageRoutes = require('./routes/messages');

// CRASH PREVENTION: Handle global errors that would normally kill the process
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err.message);
    console.error(err.stack);
    // In production, you might want to restart with a tool like PM2
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 8080; // Railway uses 8080 usually

// 1. MUST BE FIRST: Trust the proxy
app.set('trust proxy', 1);
console.log('[Server] Start-up: Trust Proxy enabled.');

// SECURITY: Set security-related HTTP headers
app.use(helmet());

// SECURITY: Basic Rate Limiting to prevent DDoS/Brute Force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests.',
    validate: { trustProxy: false }, // Disables the check that's causing the crash
});
app.use('/api/', limiter);

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Reduced slightly for safety
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/vaults', vaultRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'Photography Studio API is secure and running.' });
});

// GLOBAL ERROR HANDLER: Catch any errors from routes
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.stack);
    res.status(err.status || 500).json({
        error: true,
        message: process.env.NODE_ENV === 'production'
            ? 'An internal server error occurred'
            : err.message
    });
});

app.listen(PORT, () => {
    console.log(`[Secure Server] Running on port ${PORT}`);
});
