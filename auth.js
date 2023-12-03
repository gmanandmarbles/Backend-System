const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const admin = require('./firebaseConfig.js');
const serviceAccount = require('./firebasekey.json');

const firestore = admin.firestore();
const usersCollection = firestore.collection('users');

module.exports = function (app) {
    let users = [];

    function generateRandomUsername(users, maxAttempts = 5) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomUsername = '';
        let attempts = 0;

        while (attempts < maxAttempts) {
            randomUsername = '';
            for (let i = 0; i < 4; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                randomUsername += characters.charAt(randomIndex);
            }

            if (!users.some((user) => user.username === randomUsername)) {
                return randomUsername;
            }

            attempts++;
        }

        throw new Error('Unable to generate a unique username after 5 attempts');
    }

    app.post('/api/guest', async (req, res) => {
        console.log('Received guest user registration request:', req.body);

        try {
            // Make a random 4 character username
            const randomUsername = generateRandomUsername(users);

            // Default password is 1234
            const defaultPassword = '1234';

            // create a new guest user with a random username and password.
            const newGuestUser = {
                username: randomUsername,
                password: defaultPassword,
                guest: true, // Add a flag in Firestore to mark as a guest user.
            };

            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newGuestUser.password, salt);

            // Save as encrypted password.
            newGuestUser.password = hashedPassword;

            // Use the username as the document ID
            newGuestUser.id = newGuestUser.username;

            // Save the user data to Firestore
            await usersCollection.doc(newGuestUser.id).set(newGuestUser);

            console.log('Guest user registration successful:', newGuestUser);

            res.json({ message: 'Guest user registration successful', newGuestUser });
        } catch (error) {
            console.error('Error:', error);

            // error report
            reportError(error);

            res.status(500).json({ error: 'Internal server error', fullError: error.message });
        }
    });

    app.post('/api/users', async (req, res) => {
        console.log('Received user registration request:', req.body);
        const newUser = req.body;

        try {
            // Check if the username already exists
            const existingUserQuery = await usersCollection.where('username', '==', newUser.username).get();
            if (!existingUserQuery.empty) {
                console.log('Username already exists');

                return res.json({ error: 'Username already exists' });

                // Report the error
                reportError(new Error('Username already exists'));

                return res.status(409).json({ error: 'Username already exists' });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newUser.password, salt);

            // Update the password with the hashed version
            newUser.password = hashedPassword;

            // Use the username as the document ID
            newUser.id = newUser.username;

            // Save the user data to Firestore
            await usersCollection.doc(newUser.id).set(newUser);

            console.log('User registration successful:', newUser);

            res.json({ message: 'User registration successful', newUser });
        } catch (error) {
            console.error('Error:', error);

            // Report the error
            reportError(error);

            res.status(500).json({ error: 'Internal server error', fullError: error.message });
        }
    });

    app.post('/api/login', async (req, res) => {
        console.log('Received login request:', req.body);

        const { username, password } = req.body;

        // Check if the user exists
        const userQuery = await usersCollection.where('username', '==', username).limit(1).get();
        if (userQuery.empty) {
            console.log('User not found');

            // Report the error
            reportError(new Error('User not found'));

            return res.status(404).json({ error: 'User not found' });
        }

        const user = userQuery.docs[0].data();

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password');

            // Report the error
            reportError(new Error('Invalid password'));

            return res.status(401).json({ error: 'Invalid password' });
        }

        console.log('Login successful');
        return res.status(200).json({ userId: user.id });
    });

    // Load users from Firestore on server start
    async function loadUsersFromFirestore() {
        try {
            const usersSnapshot = await usersCollection.get();
            users = usersSnapshot.docs.map((doc) => doc.data());
            console.log('Users loaded successfully');
        } catch (error) {
            console.error('Error reading users from Firestore:', error);
            reportError(error);
        }
    }

    loadUsersFromFirestore();

    function reportError(error) {
        // Send the error details to the error handling endpoint
        const errorData = {
            errorMessage: error.message,
            stackTrace: error.stack,
            // Add other relevant error details if needed
        };

        // You can adjust the endpoint URL accordingly
        const errorEndpoint = 'http://localhost:3000/api/error-report';

        // Send the error details to the error handling endpoint
        // Adjust the method and headers based on your server's requirements
        fetch(errorEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorData),
        })
            .then((response) => response.json())
            .then((data) => console.log('Error reported successfully:', data))
            .catch((err) => console.error('Error reporting error:', err));
    }
};
