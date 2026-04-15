require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files (Vite build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bot');
const callbackRoutes = require('./routes/callback');

app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/bot/callback', callbackRoutes);

// Catch all for React routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`OAuth2 Callback: ${process.env.DISCORD_REDIRECT_URI}`);
});

// Start Routine Worker
require('./services/routine');
