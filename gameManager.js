
const express = require('express');
const admin = require('./firebaseConfig');
const fs = require('fs/promises');
const path = require('path');

const firestore = admin.firestore();
const storageCollection = firestore.collection('storage');

module.exports = function (app) {
    console.log("GameManager Initialized");

    function generateRandomID() {
        return Math.random().toString(36).substring(7);
    }
    
    // Helper function to generate a random integer in a given range
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Endpoint to create a new game
    app.post('/api/gamemanager/creategame', async (req, res) => {
        try {
            // Generate a random game ID and WebSocket port
            const gameID = generateRandomID();
            const websocketPort = getRandomInt(3000, 5000);
            const seed = getRandomInt(1000, 9999); // Randomly generated seed
    
            // Save game information to Firebase Firestore
            const gameDocRef = storageCollection.doc(gameID);
            await gameDocRef.set({
                gameID,
                websocketPort,
                seed,
                players: [],
            });
    
            // Save game information locally
            const gameFilePath = path.join(__dirname, 'userData', 'games', `${gameID}.json`);
            await fs.writeFile(gameFilePath, JSON.stringify({ gameID, websocketPort, seed, players: [] }, null, 2), 'utf-8');
    
            res.json({ gameID, websocketPort, seed });
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
            // Retrieve game information from Firebase Firestore
            const gameDocRef = storageCollection.doc(gameID);
            const gameData = (await gameDocRef.get()).data();
    
            if (gameData) {
                // Add the player to the list of players
                const updatedPlayers = [...gameData.players, username];
    
                // Update game information in Firebase Firestore
                await gameDocRef.update({ players: updatedPlayers });
    
                // Update game information locally
                const gameFilePath = path.join(__dirname, 'userData', 'games', `${gameID}.json`);
                await fs.writeFile(gameFilePath, JSON.stringify({ ...gameData, players: updatedPlayers }, null, 2), 'utf-8');
    
                res.json({
                    message: `${username} has joined the game ${gameID}`,
                    players: updatedPlayers,
                    seed: gameData.seed,
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
