
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


module.exports = function (app) {
console.log('Error-reports have been initialized successfully');
app.post('/api/error-report', (req, res) => {
    try {
      const errorData = req.body;
  
      // Generate a unique ID for the error report
      const errorId = uuidv4().substring(0, 4);

      // Create a directory based on the current date
      const currentDate = new Date().toISOString().split('T')[0];
      const errorReportsDir = path.join(__dirname, 'errorreports', currentDate);
  
      // Create the directory if it doesn't exist
      if (!fs.existsSync(errorReportsDir)) {
        fs.mkdirSync(errorReportsDir, { recursive: true });
      }
  
      // Create the filename for the error report
      const errorFilename = path.join(errorReportsDir, `${errorId}.json`);
  
      // Save the error data to the JSON file
      fs.writeFileSync(errorFilename, JSON.stringify(errorData, null, 2));
      console.log('saved the error');
      // Return the filename in the response
      res.json({ filename: errorFilename });
    } catch (error) {
      console.error('Error saving error report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};