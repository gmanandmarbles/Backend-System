const express = require('express');
const admin = require('./firebaseConfig');
const fs = require('fs/promises');
const path = require('path');

const firestore = admin.firestore();
const storageCollection = firestore.collection('storage');

module.exports = function (app) {
    console.log("PlayerPrefs Initialized");

    // Define the base directory for storing user data locally
    const dataDir = path.join(__dirname, 'userData');

    // Middleware to create a directory for the user if it doesn't exist
    app.param('userID', async (req, res, next, userID) => {
        const userDocRef = storageCollection.doc(userID);
        const userDir = path.join(dataDir, userID);

        try {
            // Create the user document if it doesn't exist
            await userDocRef.set({});
            
            // Create the user directory if it doesn't exist locally
            await fs.mkdir(userDir, { recursive: true });

            req.userDocRef = userDocRef;
            req.userDir = userDir;

            next();
        } catch (err) {
            next(err);
        }
    });

    // GET endpoint to retrieve JSON data
    app.get('/api/storage/user/:userID/:filename', async (req, res) => {
        const { userDocRef, userDir } = req;
        const filename = req.params.filename;
        const filePath = path.join(userDir, filename);

        try {
            // Get the user document data
            const userData = (await userDocRef.get()).data();

            // Check if the filename exists in the user data
            if (userData && userData.hasOwnProperty(filename)) {
                res.json(userData[filename]);
            } else {
                try {
                    // Read the local JSON file if it exists
                    const data = await fs.readFile(filePath, 'utf-8');
                    res.json(JSON.parse(data));
                } catch (localErr) {
                    res.status(404).json({ error: 'File not found' });
                }
            }
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // POST endpoint to save JSON data
    app.post('/api/storage/user/:userID/:filename', async (req, res) => {
        const { userDocRef, userDir } = req;
        const filename = req.params.filename;
        const jsonData = req.body;
        const filePath = path.join(userDir, filename);

        try {
            // Update the user document with the new data
            await userDocRef.update({ [filename]: jsonData });

            // Write the local JSON data to the file
            await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

            res.json({ message: 'Data saved successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};
