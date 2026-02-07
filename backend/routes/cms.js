const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const writeFileAtomic = require('write-file-atomic');

const CMS_PATH = path.join(__dirname, '../data/cms.json');

const readJSON = () => {
    try {
        if (!fs.existsSync(CMS_PATH)) return { items: [], hero: { slides: [], interval: 5 }, graphics: {} };
        let content = fs.readFileSync(CMS_PATH, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        if (!content.trim()) return { items: [], hero: { slides: [], interval: 5 }, graphics: {} };
        const data = JSON.parse(content);

        // AUTO-MIGRATION: If legacy array, wrap it
        if (Array.isArray(data)) {
            return { items: data, hero: { slides: [], interval: 5 }, graphics: {} };
        }

        // Ensure defaults
        if (!data.items) data.items = [];
        if (!data.hero) data.hero = { slides: [], interval: 5 };
        if (!data.graphics) data.graphics = {};

        return data;
    } catch (e) {
        console.error(`[CMS] Error reading:`, e.message);
        return { items: [], hero: { slides: [], interval: 5 }, graphics: {} };
    }
};

const writeJSON = async (data) => {
    try {
        // Using synchronous write for better reliability on some Windows environments
        fs.writeFileSync(CMS_PATH, JSON.stringify(data, null, 2));
        console.log(`[CMS] successfully updated ${CMS_PATH}`);
    } catch (e) {
        console.error(`[CMS] Write failed:`, e);
        throw e; // Critical: allow routes to return 500
    }
};

router.get('/', (req, res) => {
    res.json(readJSON());
});

// Gallery Items
router.post('/gallery', async (req, res) => {
    const { url, title, type } = req.body;
    const cms = readJSON();

    const newItem = {
        id: Date.now().toString(),
        url,
        title,
        type: type || 'exhibition'
    };

    cms.items.push(newItem);
    await writeJSON(cms);
    res.json(newItem);
});

router.delete('/gallery/:id', async (req, res) => {
    const { id } = req.params;
    const cms = readJSON();

    cms.items = cms.items.filter(item => item.id !== id);
    await writeJSON(cms);
    res.json({ success: true });
});

// HERO MANAGEMENT
router.post('/hero/slides', async (req, res) => {
    const { url, type } = req.body;
    const cms = readJSON();

    const newSlide = {
        id: Date.now().toString(),
        url,
        type: type || 'image' // image or video
    };

    cms.hero.slides.push(newSlide);
    await writeJSON(cms);
    res.json(newSlide);
});

router.delete('/hero/slides/:id', async (req, res) => {
    const { id } = req.params;
    const cms = readJSON();

    cms.hero.slides = cms.hero.slides.filter(s => s.id !== id);
    await writeJSON(cms);
    res.json({ success: true });
});

router.post('/hero/config', async (req, res) => {
    const { interval } = req.body;
    const cms = readJSON();

    cms.hero.interval = parseInt(interval) || 5;
    await writeJSON(cms);
    res.json(cms.hero);
});

// SECTION GRAPHICS (THE ARTIST, WHO WE ARE, READY TO BEGIN)
router.post('/graphics', async (req, res) => {
    const { key, url } = req.body;
    if (!key || !url) return res.status(400).json({ error: 'Missing key or url' });

    const cms = readJSON();
    cms.graphics[key] = url;
    await writeJSON(cms);
    res.json({ success: true, graphics: cms.graphics });
});

module.exports = router;

