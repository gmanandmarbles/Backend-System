const express = require('express');
const admin = require('./firebaseConfig');
const fs = require('fs/promises');
const path = require('path');

const firestore = admin.firestore();
// Update Firestore collection to "games"
const gamesCollection = firestore.collection('games');

module.exports = function (app) {
    console.log("GameManager Initialized");

    function generateRandomID() {
        return Math.random().toString(36).substring(7);
    }

    // Helper function to generate a random integer in a given range
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Endpoint to get game data by game ID
    app.get('/api/gamemanager/game/:id', async (req, res) => {
        const gameID = req.params.id;  // Extract game ID from URL parameter

        try {
            // Retrieve game data from Firebase Firestore (from the "games" collection)
            const gameDocRef = gamesCollection.doc(gameID);
            const gameData = (await gameDocRef.get()).data();

            // Check if the game data exists
            if (gameData) {
                // Respond with the game data (websocket port, seed, players, and creation time)
                res.json({
                    gameID: gameData.gameID,
                    websocketPort: gameData.websocketPort,
                    seed: gameData.seed,
                    players: gameData.players,
                    createdAt: gameData.createdAt  // Send the creation date and time
                });
            } else {
                // If the game doesn't exist, return a 404 error
                res.status(404).json({ error: 'Game not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Endpoint to create a new game
    app.post('/api/gamemanager/creategame', async (req, res) => {
        try {
            // Generate a random game ID and WebSocket port
            const gameID = generateRandomID();
            const websocketPort = getRandomInt(3001, 5000);
            const seed = getRandomInt(1000, 9999); // Randomly generated seed

            // Get current date and time for the game creation timestamp
            const createdAt = new Date().toISOString(); // ISO 8601 format (e.g., "2024-12-18T14:35:00Z")

            // Save game information to Firebase Firestore (in "games" collection)
            const gameDocRef = gamesCollection.doc(gameID);
            await gameDocRef.set({
                gameID,
                websocketPort,
                seed,
                players: [],
                createdAt,  // Add createdAt timestamp
            });

            // Save game information locally (to file), including createdAt timestamp
            const gameFilePath = path.join(__dirname, 'userData', 'games', `${gameID}.json`);
            await fs.writeFile(gameFilePath, JSON.stringify({ gameID, websocketPort, seed, players: [], createdAt }, null, 2), 'utf-8');

            res.json({ gameID, websocketPort, seed, createdAt });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Endpoint for players to join a specific game
    app.post('/api/gamemanager/join/:id', async (req, res) => {
        const gameID = req.params.id;
        const { username } = req.body;

        try {
            // Retrieve game information from Firebase Firestore (from "games" collection)
            const gameDocRef = gamesCollection.doc(gameID);
            const gameData = (await gameDocRef.get()).data();

            if (gameData) {
                // Add the player to the list of players
                const updatedPlayers = [...gameData.players, username];

                // Update game information in Firebase Firestore (in "games" collection)
                await gameDocRef.update({ players: updatedPlayers });

                // Update game information locally
                const gameFilePath = path.join(__dirname, 'userData', 'games', `${gameID}.json`);
                await fs.writeFile(gameFilePath, JSON.stringify({ ...gameData, players: updatedPlayers }, null, 2), 'utf-8');

                res.json({
                    message: `${username} has joined the game ${gameID}`,
                    players: updatedPlayers,
                    seed: gameData.seed,
                    createdAt: gameData.createdAt, // Include createdAt timestamp in the response
                });
            } else {
                res.status(404).json({ error: 'Game not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};
