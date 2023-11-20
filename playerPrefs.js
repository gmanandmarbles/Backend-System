const express = require('express');
const fs = require('fs/promises');
const path = require('path');


module.exports = function (app) {
  console.log("PlayerPrefs Initialized");
  // Define the base directory for storing user data
  const dataDir = path.join(__dirname, 'userData');

  // Middleware to create a directory for the user if it doesn't exist
  app.param('userID', async (req, res, next, userID) => {
    const userDir = path.join(dataDir, userID);

    try {
      // Create the user directory if it doesn't exist
      await fs.mkdir(userDir, { recursive: true });
      req.userDir = userDir;
      next();
    } catch (err) {
      next(err);
    }
  });

  // GET endpoint to retrieve JSON data
  app.get('/api/storage/user/:userID/:filename', async (req, res) => {
    const { userDir } = req;
    const filename = req.params.filename;
    const filePath = path.join(userDir, filename);

    try {
      // Read the JSON file
      const data = await fs.readFile(filePath, 'utf-8');
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });

  // POST endpoint to save JSON data
  app.post('/api/storage/user/:userID/:filename', async (req, res) => {
    const { userDir } = req;
    const filename = req.params.filename;
    const filePath = path.join(userDir, filename);
    const jsonData = req.body;

    try {
      // Write the JSON data to the file
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
      res.json({ message: 'Data saved successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};