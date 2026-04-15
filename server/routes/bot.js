const router = require('express').Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'obsidian-secret';

// Middleware to verify user token
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// Get User's Bots
router.get('/', authenticateUser, (req, res) => {
    const bots = db.prepare('SELECT id, client_id, status, added_at FROM user_bots WHERE user_id = ?').all(req.user.discord_id);
    res.json(bots);
});

// Add a Bot
router.post('/', authenticateUser, (req, res) => {
    const { client_id, client_secret, bot_token } = req.body;

    if (!client_id || !client_secret || !bot_token) {
        return res.status(400).json({ error: 'Missing bot credentials' });
    }

    // Check free limit (1 bot)
    const existingBots = db.prepare('SELECT COUNT(*) as count FROM user_bots WHERE user_id = ?').get(req.user.discord_id).count;
    const user = db.prepare('SELECT is_premium FROM users WHERE discord_id = ?').get(req.user.discord_id);

    if (existingBots >= 1 && !user.is_premium) {
        return res.status(403).json({ error: 'Free tier limited to 1 bot. Upgrade to Premium for more.' });
    }

    const botId = uuidv4();
    try {
        db.prepare(`
            INSERT INTO user_bots (id, user_id, client_id, client_secret, bot_token)
            VALUES (?, ?, ?, ?, ?)
        `).run(botId, req.user.discord_id, client_id, client_secret, bot_token);

        // Initialize empty routine record
        db.prepare('INSERT INTO routines (id, bot_id) VALUES (?, ?)').run(uuidv4(), botId);

        res.json({ id: botId, message: 'Bot added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Bot
router.delete('/:id', authenticateUser, (req, res) => {
    const { id } = req.params;
    const bot = db.prepare('SELECT * FROM user_bots WHERE id = ? AND user_id = ?').get(id, req.user.discord_id);
    
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    db.prepare('DELETE FROM user_bots WHERE id = ?').run(id);
    db.prepare('DELETE FROM routines WHERE bot_id = ?').run(id);
    db.prepare('DELETE FROM pooled_users WHERE bot_id = ?').run(id);

    res.json({ message: 'Bot deleted successfully' });
});

module.exports = router;
