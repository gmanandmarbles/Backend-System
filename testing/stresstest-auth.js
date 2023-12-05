const axios = require('axios');
const cliProgress = require('cli-progress');

// Change the base URL to match your server's address and port
const baseURL = 'http://localhost:3000/api';

const totalTests = 1600; // Total number of tests in your script

async function testEndpoints() {
  // create a new progress bar instance and use shades_classic theme
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  // start the progress bar with a total value of totalTests and start value of 0
  progressBar.start(totalTests, 0);

  for (let i = 0; i < totalTests; i++) {
    // Execute the test for each endpoint sequentially
    await testEndpoint(i + 1, progressBar);
  }

  // stop the progress bar
  progressBar.stop();

  console.log('All tests completed!');
}

async function testEndpoint(testNumber, progressBar) {
  try {
    // Test guest user registration
    await axios.post(`${baseURL}/guest`);

    // Increment the progress bar
    progressBar.increment();
  } catch (error) {
    handleTestError(`Test ${testNumber}`, error);
  }
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
