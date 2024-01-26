const axios = require('axios');

// Define the base URL for your API
const baseUrl = 'http://localhost:3000/api/game'; // Replace with your actual API base URL

// Function to test the creategame endpoint
async function testCreateGame() {
    try {
        const response = await axios.post(`${baseUrl}/creategame`);
        console.log('Create Game Response:', response.data);
    } catch (error) {
        console.error('Error creating game:', error.message);
    }
}

// Function to test the join endpoint
async function testJoinGame(gameID, username) {
    try {
        const response = await axios.post(`${baseUrl}/join/${gameID}`, { username });
        console.log('Join Game Response:', response.data);
    } catch (error) {
        console.error('Error joining game:', error.message);
    }
}

// Test the creategame endpoint
testCreateGame();

// Test the join endpoint with a specific game ID and username
const testGameID = 'your-game-id'; // Replace with an actual game ID
const testUsername = 'test-player'; // Replace with a desired username
testJoinGame(testGameID, testUsername);
