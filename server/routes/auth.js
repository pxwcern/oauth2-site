const router = require('express').Router();
const axios = require('axios');
const db = require('../db');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'obsidian-secret';

// Service Login URL
router.get('/login', (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(url);
});

// OAuth2 Callback for the service
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI
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

        // Store or update user
        db.prepare(`
            INSERT INTO users (discord_id, username, access_token, refresh_token, token_expiry)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(discord_id) DO UPDATE SET
                username = EXCLUDED.username,
                access_token = EXCLUDED.access_token,
                refresh_token = EXCLUDED.refresh_token,
                token_expiry = EXCLUDED.token_expiry
        `).run(id, username, access_token, refresh_token, expires_at);

        // Generate JWT for the user
        const token = jwt.sign({ discord_id: id, username }, JWT_SECRET, { expiresIn: '7d' });

        // Redirect to dashboard with token
        res.redirect(`/?token=${token}`);

    } catch (error) {
        console.error('Auth Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Login failed');
    }
});

module.exports = router;
