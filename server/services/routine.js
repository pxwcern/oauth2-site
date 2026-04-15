const cron = require('node-cron');
const axios = require('axios');
const db = require('../db');
const { sendWebhook, routineEmbed, routineStartedEmbed } = require('./webhook');

const runRoutineForBot = async (bot) => {
    console.log(`Starting Routine for Bot ID: ${bot.id} (${bot.client_id})...`);
    const startTime = Date.now();

    // Fetch pooled users for this specific bot
    const pooledUsers = db.prepare('SELECT * FROM pooled_users WHERE bot_id = ?').all(bot.id);
    
    let stats = {
        totalOAuths: pooledUsers.length,
        alive: 0,
        refreshed: 0,
        failed: 0,
        deleted: 0,
        httpError: 0,
    };

    // "Started" Webhook for this bot
    if (bot.webhook_url) {
        await sendWebhook(bot.webhook_url, routineStartedEmbed({ totalOAuths: stats.totalOAuths, totalBots: 1 }));
    }

    for (const user of pooledUsers) {
        try {
            const now = Math.floor(Date.now() / 1000);
            if (user.expires_at < now + 86400) {
                // Refresh
                try {
                    const response = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
                        client_id: bot.client_id,
                        client_secret: bot.client_secret,
                        grant_type: 'refresh_token',
                        refresh_token: user.refresh_token
                    }), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    const { access_token, refresh_token, expires_in } = response.data;
                    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

                    db.prepare('UPDATE pooled_users SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = ?')
                        .run(access_token, refresh_token, expires_at, user.id);

                    stats.refreshed++;
                    stats.alive++;
                } catch (refreshError) {
                    console.error(`Refresh error for bot ${bot.id}, user ${user.discord_id}:`, refreshError.message);
                    stats.failed++;
                }
            } else {
                // Verify
                try {
                    await axios.get('https://discord.com/api/users/@me', {
                        headers: { Authorization: `Bearer ${user.access_token}` }
                    });
                    stats.alive++;
                } catch (verifyError) {
                    if (verifyError.response && verifyError.response.status === 401) stats.deleted++;
                    else stats.httpError++;
                }
            }
        } catch (error) {
            stats.httpError++;
        }
    }

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const routineData = { ...stats, duration: durationSeconds, nextIn: 1 };

    // "Finished" Webhook for this bot
    if (bot.webhook_url) {
        await sendWebhook(bot.webhook_url, routineEmbed(routineData));
    }

    // Update routine stats in DB for this bot
    db.prepare(`
        UPDATE routines SET 
            status = 'idle',
            last_run = CURRENT_TIMESTAMP,
            stats_alive = ?,
            stats_refreshed = ?,
            stats_failed = ?,
            stats_deleted = ?,
            stats_http_error = ?
        WHERE bot_id = ?
    `).run(stats.alive, stats.refreshed, stats.failed, stats.deleted, stats.httpError, bot.id);
};

const runGlobalRoutine = async () => {
    console.log('--- GLOBAL ROUTINE STARTED ---');
    const activeBots = db.prepare('SELECT * FROM user_bots WHERE status = ?').all('active');
    
    for (const bot of activeBots) {
        await runRoutineForBot(bot);
    }
    console.log('--- GLOBAL ROUTINE FINISHED ---');
};

// Hourly check across all user bots
cron.schedule('0 * * * *', runGlobalRoutine);

// Start on boot after 10s
setTimeout(runGlobalRoutine, 10000);

module.exports = { runGlobalRoutine };
