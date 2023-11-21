const axios = require('axios');

// Change the base URL to match your server's address and port
const baseURL = 'http://localhost:3000/api';

const totalTests = 5000000000; // Total number of tests in your script

async function testEndpoints() {
  for (let i = 0; i < totalTests; i++) {
    try {
      // Test guest user registration
      await axios.post(`${baseURL}/guest`);

      // Calculate and display the percentage of completion
      const percentage = ((i + 1) / totalTests) * 100;
      console.log(`Test ${i + 1} completed. Progress: ${percentage.toFixed(2)}%`);
    } catch (error) {
      handleTestError(`Test ${i + 1}`, error);
    }
  }

  console.log('All tests completed!');
}

async function handleTestError(testName, error) {
  console.error(`${testName} Test Error:`, error.response ? error.response.data : error.message);

  try {
    // Send the error data to the server's error endpoint
    await axios.post(`${baseURL}/error-report`, {
      testName,
      error: error.response ? error.response.data : error.message,
    });
  } catch (error) {
    console.error('Error sending error report to server:', error);
  }
}

// Execute the test script
testEndpoints();
