const axios = require('axios');

// Define the base URL for your API (updated to the correct endpoint)
const baseUrl = 'http://localhost:3000/api/gamemanager'; // Corrected base URL

// Function to test the creategame endpoint
async function testCreateGame() {
    try {
        const response = await axios.post(`${baseUrl}/creategame`);
        console.log('Create Game Response:', response.data);
        return response.data;  // Return the game data (used for subsequent tests)
    } catch (error) {
        console.error('Error creating game:', error.message);
        throw error;  // Stop execution if creating the game fails
    }
}

// Function to test the join endpoint
async function testJoinGame(gameID, username) {
    try {
        const response = await axios.post(`${baseUrl}/join/${gameID}`, { username });
        console.log('Join Game Response:', response.data);
        return response.data;  // Return the updated game data (used for subsequent tests)
    } catch (error) {
        console.error('Error joining game:', error.message);
        throw error;  // Stop execution if joining the game fails
    }
}

// Function to test the get game data endpoint
async function testGetGameData(gameID) {
    try {
        const response = await axios.get(`${baseUrl}/game/${gameID}`);
        console.log('Get Game Data Response:', response.data);
    } catch (error) {
        console.error('Error fetching game data:', error.message);
        throw error;  // Stop execution if fetching game data fails
    }
}

// Fully automated test sequence to test all features
async function runAutomatedTests() {
    try {
        // Step 1: Create a new game
        const createdGame = await testCreateGame();
        const gameID = createdGame.gameID;

        // Step 2: Join the game with multiple test players
        const usernames = ['test-player1', 'test-player2', 'test-player3'];
        for (const username of usernames) {
            await testJoinGame(gameID, username);
        }

        // Step 3: Fetch the game data
        await testGetGameData(gameID);

    } catch (error) {
        console.error('Test sequence failed:', error.message);
    }
}

// Run the automated tests
runAutomatedTests();
