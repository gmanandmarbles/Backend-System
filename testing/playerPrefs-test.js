const axios = require('axios');
const fs = require('fs');

// Change the base URL to match your server's address and port
const baseURL = 'http://localhost:3000/api';

async function testStorageEndpoints() {
  try {
    // Test GET endpoint to retrieve JSON data
    const getUserDataResponse = await axios.get(`${baseURL}/storage/user/testUser/testfile.json`);
    console.log('Get User Data Response:', getUserDataResponse.data);
  } catch (error) {
    handleTestError('Get User Data', error);
  }

  try {
    // Test POST endpoint to save JSON data
    const saveUserData = {
      key1: 'value1',
      key2: 'value2',
    };

    const saveUserDataResponse = await axios.post(`${baseURL}/storage/user/testUser/testfile.json`, saveUserData);
    console.log('Save User Data Response:', saveUserDataResponse.data);
  } catch (error) {
    handleTestError('Save User Data', error);
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

// Execute the test script for storage endpoints
testStorageEndpoints();
