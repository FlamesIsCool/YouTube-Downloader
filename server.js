const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const downloadRoutes = require('./routes/download');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Routes
app.use('/api', downloadRoutes);

// WebSocket for progress updates
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Make WebSocket server available to routes
app.set('wss', wss);

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`YouTube Downloader server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

module.exports = app;