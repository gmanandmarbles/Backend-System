const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const admin = require('./firebaseConfig');


const firestore = admin.firestore();
const errorReportsCollection = firestore.collection('errorReports');

module.exports = function (app) {
    console.log('Error-reports have been initialized successfully');

    app.post('/api/error-report', async (req, res) => {
        try {
            const errorData = req.body;

            // Generate a unique ID for the error report
            const errorId = uuidv4().substring(0, 4);

            // Save the error data to the local file
            const localErrorFilename = saveToLocalFile(errorId, errorData);
            console.log('Saved the error locally:', localErrorFilename);

            // Save the error data to Firestore
            await saveToFirestore(errorId, errorData);
            console.log('Saved the error to Firestore');

            // Return the filename in the response
            res.json({ filename: localErrorFilename });
        } catch (error) {
            console.error('Error saving error report:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};

function saveToLocalFile(errorId, errorData) {
    const currentDate = new Date().toISOString().split('T')[0];
    const errorReportsDir = path.join(__dirname, './errorreports', currentDate);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(errorReportsDir)) {
        fs.mkdirSync(errorReportsDir, { recursive: true });
    }

    // Create the filename for the error report
    const errorFilename = path.join(errorReportsDir, `${errorId}.json`);

    // Save the error data to the JSON file
    fs.writeFileSync(errorFilename, JSON.stringify(errorData, null, 2));

    return errorFilename;
}

async function saveToFirestore(errorId, errorData) {
    // Use the error ID as the document ID
    const errorReportDocRef = errorReportsCollection.doc(errorId);

    // Save the error data to Firestore
    await errorReportDocRef.set(errorData);
}
