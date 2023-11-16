const axios = require('axios');
const fs = require('fs');

// Change the base URL to match your server's address and port
const baseURL = 'http://localhost:3000/api';

async function testEndpoints() {
  try {
    // Test guest user registration
    const guestRegistrationResponse = await axios.post(`${baseURL}/guest`);
    console.log('Guest Registration Response:', guestRegistrationResponse.data);
  } catch (error) {
    handleTestError('Guest Registration', error);
  }

  try {
    // Test user registration
    const userRegistrationData = {
      username: 'testuser',
      password: 'testpassword',
    };
    const userRegistrationResponse = await axios.post(`${baseURL}/users`, userRegistrationData);
    console.log('User Registration Response:', userRegistrationResponse.data);
  } catch (error) {
    handleTestError('User Registration', error);
  }

  try {
    // Test user login
    const loginData = {
      username: 'testuser',
      password: 'testpassword',
    };
    const loginResponse = await axios.post(`${baseURL}/login`, loginData);
    console.log('Login Response:', loginResponse.data);
    console.log('Sent over the proper login');
  } catch (error) {
    handleTestError('User Login', error);
  }

  try {
    // Test non-existent user login (should result in a 404 error)
    const nonExistentUserLoginData = {
      username: 'nonexistentuser',
      password: 'testpassword',
    };
    await axios.post(`${baseURL}/login`, nonExistentUserLoginData);
    console.log('Sent over the non-existentuser');
  } catch (error) {
    handleTestError('Non-existent User Login', error);
  }

  try {
    // Test invalid password login (should result in a 401 error)
    const invalidPasswordLoginData = {
      username: 'testuser',
      password: 'wrongpassword',
    };
    await axios.post(`${baseURL}/login`, invalidPasswordLoginData);
    console.log('Sent over the non-correct password');
  } catch (error) {
    handleTestError('Invalid Password Login', error);
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
