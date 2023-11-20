//Importing requirements
const express = require('express');

//Importing endpoint files.
const authentication = require('./auth.js');
const errorReports = require('./error-reports.js');
const playerPrefs = require('./playerPrefs.js');

//Setting up the port and the express app.
const app = express();
const port = 3000; // or any other port you want to use


// Specifying the way express should parse the incoming data, only use JSON data please.
app.use(express.json());

// Connect the other files.
authentication(app);
errorReports(app);
playerPrefs(app);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
