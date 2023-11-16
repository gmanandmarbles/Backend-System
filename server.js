//Importing requirements
const express = require('express');

//Importing endpoint files.
const authentication = require('./auth.js');
const errorReports = require('./error-reports.js');

//Setting up the port and the express app.
const app = express();
const port = 3000; // or any other port you want to use


//Specifying the way express should parse the incoming data, only use JSON data please.
app.use(express.json());

// Pass the 'app' object to the authentication module
authentication(app);
errorReports(app);


// The error function, for if an error occurs.
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);

  // Log the error to the error report endpoint
  axios.post('http://localhost:3000/api/error-report', {
    timestamp: new Date().toISOString(),
    error: err.message || 'Internal server error',
  }).catch((error) => {
    console.error('Error sending error report:', error);
  });

  // Send an error response to the client
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
