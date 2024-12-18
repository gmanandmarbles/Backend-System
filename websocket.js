const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const admin = require('./firebaseConfig');
const WebSocket = require('ws'); // WebSocket library

const firestore = admin.firestore();
const errorReportsCollection = firestore.collection('errorReports');

module.exports = function (app) {
    console.log('WebSocket server initialized successfully');

    // WebSocket server endpoint
    app.post('/api/create-websocket', (req, res) => {
        const { port } = req.body;

        if (!port) {
            return res.status(400).json({ error: 'Port is required' });
        }

        try {
            const wss = new WebSocket.Server({ port });

            wss.on('connection', (ws) => {
                console.log('New WebSocket connection established');

                // Send a message to the client once connected
                ws.send(JSON.stringify({ message: 'WebSocket server is running' }));

                // Handle incoming messages from the client
                ws.on('message', (message) => {
                    console.log('Received:', message);
                });

                // Handle connection closure
                ws.on('close', () => {
                    console.log('WebSocket connection closed');
                });
            });

            console.log(`WebSocket server running on port ${port}`);
            res.json({ message: `WebSocket server created on port ${port}` });
        } catch (error) {
            console.error('Error creating WebSocket server:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};
