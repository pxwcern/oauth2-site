const router = require('express').Router();
const axios = require('axios');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// OAuth2 Callback for USER BOTS (pooling members)
router.get('/', async (req, res) => {
    const { code, state: bot_id } = req.query;

    if (!code || !bot_id) {
        return res.status(400).send('Missing code or bot_id');
    }

    // Get bot credentials
    const bot = db.prepare('SELECT id, client_id, client_secret FROM user_bots WHERE id = ?').get(bot_id);
    if (!bot) return res.status(404).send('Bot not found');

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: bot.client_id,
            client_secret: bot.client_secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.BOT_REDIRECT_URI || 'https://csbl.lol/api/bot/callback'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        const expires_at = Math.floor(Date.now() / 1000) + expires_in;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const { id, username } = userResponse.data;

        // Store pooled user
        db.prepare(`
            INSERT INTO pooled_users (id, bot_id, discord_id, username, access_token, refresh_token, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(discord_id, bot_id) DO UPDATE SET
                username = EXCLUDED.username,
                access_token = EXCLUDED.access_token,
                refresh_token = EXCLUDED.refresh_token,
                expires_at = EXCLUDED.expires_at
        `).run(uuidv4(), bot_id, id, username, access_token, refresh_token, expires_at);

        res.redirect('/success?bot=' + encodeURIComponent(bot_id));

    } catch (error) {
        console.error('Pooling Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Pooling failed');
    }
});

module.exports = router;
