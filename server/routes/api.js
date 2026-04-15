const router = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get Stats
router.get('/stats', (req, res) => {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalBots = db.prepare('SELECT COUNT(*) as count FROM bots').get().count;
    const routine = db.prepare('SELECT * FROM routines WHERE id = ?').get('main_routine');

    res.json({
        totalUsers,
        totalBots,
        routine
    });
});

// Bot Management
router.get('/bots', (req, res) => {
    const bots = db.prepare('SELECT id, client_id, owner_id, added_at FROM bots').all();
    res.json(bots);
});

router.post('/bots', (req, res) => {
    const { client_id, client_secret, bot_token } = req.body;

    if (!client_id || !client_secret || !bot_token) {
        return res.status(400).json({ error: 'Missing bot credentials' });
    }

    try {
        const insertBot = db.prepare(`
            INSERT INTO bots (id, client_id, client_secret, bot_token)
            VALUES (?, ?, ?, ?)
        `);

        const botId = uuidv4();
        insertBot.run(botId, client_id, client_secret, bot_token);

        res.json({ id: botId, message: 'Bot added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Trigger Routine Manual (Optional)
router.post('/routine/trigger', (req, res) => {
    // Routine logic is handled by the worker, but we can trigger it manually here.
    // For now, let's just return success.
    res.json({ message: 'Routine trigger queued' });
});

module.exports = router;
