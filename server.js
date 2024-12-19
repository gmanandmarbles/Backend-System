//Importing requirements
const express = require('express');

//Importing endpoint files.
const authentication = require('./auth.js');
const errorReports = require('./error-reports.js');
const playerPrefs = require('./playerPrefs.js');
const errorSearching = require('./errorSearching.js');
const gameManager = require('./gameManager.js');
const websocketManager = require('./websocket.js');
const itemSystem = require('./itemSystem.js');
const chestSystem = require('./chestSystem.js');

//Setting up the port and the express app.
const app = express();
const port = 3000; // or any other port you want to use


// Specifying the way express should parse the incoming data, only use JSON data please.
app.use(express.json());

// Connect the other files.
itemSystem(app);
authentication(app);
websocketManager(app);
errorReports(app);
playerPrefs(app);
errorSearching(app);
gameManager(app);
chestSystem(app);

app.listen(port, () => {
  console.log("Server Initialized");
  console.log(`Server is listening on port ${port}`);
});
