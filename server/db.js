const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../obsidian.db'));

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        discord_id TEXT PRIMARY KEY,
        username TEXT,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry INTEGER,
        is_premium INTEGER DEFAULT 0,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_bots (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        client_secret TEXT NOT NULL,
        bot_token TEXT NOT NULL,
        webhook_url TEXT,
        status TEXT DEFAULT 'active',
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(discord_id)
    );

    CREATE TABLE IF NOT EXISTS pooled_users (
        id TEXT PRIMARY KEY,
        bot_id TEXT NOT NULL,
        discord_id TEXT NOT NULL,
        username TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_id) REFERENCES user_bots(id)
    );

    CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        bot_id TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        last_run DATETIME,
        stats_alive INTEGER DEFAULT 0,
        stats_refreshed INTEGER DEFAULT 0,
        stats_failed INTEGER DEFAULT 0,
        stats_deleted INTEGER DEFAULT 0,
        stats_http_error INTEGER DEFAULT 0,
        FOREIGN KEY (bot_id) REFERENCES user_bots(id)
    );
`);

module.exports = db;
