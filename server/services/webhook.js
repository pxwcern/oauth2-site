const axios = require('axios');

const sendWebhook = async (webhookUrl, embed) => {
    if (!webhookUrl) {
        console.warn('Webhook URL not set for this bot');
        return;
    }

    try {
        await axios.post(webhookUrl, {
            embeds: [embed]
        });
    } catch (error) {
        console.error('Webhook Error:', error.message);
    }
};

const routineEmbed = (routineData) => {
    const { totalOAuths, alive, refreshed, failed, deleted, httpError, duration, nextIn } = routineData;

    return {
        title: '✅ Routine finished',
        color: 0x00ff00, // Green
        fields: [
            {
                name: '📅 Duration:',
                value: `0h ${Math.floor(duration / 60)}m ${duration % 60}s`,
                inline: false
            },
            {
                name: '🧠 oAuths',
                value: `${totalOAuths}`,
                inline: true
            },
            {
                name: '✅ Still alive',
                value: `${alive}`,
                inline: true
            },
            {
                name: '💙 Refreshed',
                value: `${refreshed}`,
                inline: true
            },
            {
                name: '❌ Deleted',
                value: `${deleted}`,
                inline: true
            },
            {
                name: '⚠️ Failed',
                value: `${failed}`,
                inline: true
            },
            {
                name: '💢 httpError',
                value: `${httpError}`,
                inline: true
            },
            {
                name: '🍹 Refresh failed',
                value: `0`,
                inline: false
            },
            {
                name: '📅 Next in',
                value: `in ${nextIn} hours`,
                inline: false
            }
        ],
        footer: {
            text: `Obsidian Auth • ${new Date().toLocaleString()}`,
        }
    };
};

const routineStartedEmbed = (stats) => {
    return {
        title: '⏰ Routine started',
        color: 0xffa500, // Orange
        fields: [
            {
                name: '🧠 oAuths',
                value: `${stats.totalOAuths}`,
                inline: true
            },
            {
                name: '🤖 Bots',
                value: `${stats.totalBots}`,
                inline: true
            }
        ],
        footer: {
            text: `Vortex Auth • ${new Date().toLocaleString()}`,
        }
    };
};

module.exports = {
    sendWebhook,
    routineEmbed,
    routineStartedEmbed
};
