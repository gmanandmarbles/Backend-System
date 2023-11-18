const fs = require('fs');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = function (app) {
  let users = [];
  function generateRandomUsername(users) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomUsername = '';
    
    do {
    randomUsername = '';
    for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomUsername += characters.charAt(randomIndex);
    }
    } while (users.some((user) => user.username === randomUsername));
    
    return randomUsername;
    }

  app.post('/api/guest', async (req, res) => {
    console.log('Received guest user registration request:', req.body);

    try {
      // Read the user data from the existing file.
      const usersData = fs.readFileSync('./data/users.json', 'utf8');
      const users = JSON.parse(usersData);

      // Make a random 4 character username
      const randomUsername = generateRandomUsername(users);

      // Default password is 1234
      const defaultPassword = '1234';

      // create a new guest user with random username and password.
      const newGuestUser = {
        username: randomUsername,
        password: defaultPassword,
        guest: true, // Add a flag in the json to mark as guest user.
      };

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newGuestUser.password, salt);

      // Save as encrypted password.
      newGuestUser.password = hashedPassword;

      // Make an ID.
      newGuestUser.id = uuidv4().split('-')[0];

      // Save the user data.
      users.push(newGuestUser);

      // Send to JSON file.
      fs.writeFile('./data/users.json', JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error('Error writing users file:', err);

          // error report system
          reportError(err);

          return res.status(500).json({ error: 'Internal server error' });
        }
      });

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
      // read users.
      const usersData = fs.readFileSync('./data/users.json', 'utf8');
      const users = JSON.parse(usersData);

      // Check if the username already exists
      const existingUser = users.find((user) => user.username === newUser.username);
      if (existingUser) {
        console.log('Username already exists');

        return res.json({ error : 'Username already exists'});

        // Report the error
        reportError(new Error('Username already exists'));

        return res.status(409).json({ error: 'Username already exists' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newUser.password, salt);

      // Update the password with the hashed version
      newUser.password = hashedPassword;

      // Generate a unique ID for the new user
      newUser.id = uuidv4().split('-')[0];

      // Add the new user to the users array
      users.push(newUser);

      // Save the updated users array to the JSON file
      fs.writeFile('./data/users.json', JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error('Error writing users file:', err);

          // Report the error
          reportError(err);

          return res.status(500).json({ error: 'Internal server error' });
        }
      });

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
    const user = users.find((user) => user.username === username);
    if (!user) {
      console.log('User not found');

      // Report the error
      reportError(new Error('User not found'));

      return res.status(404).json({ error: 'User not found' });
    }

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

  // Load users from the JSON file on server start
  fs.readFile('./data/users.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users file:', err);
      reportError(err);
    } else {
      users = JSON.parse(data);
      console.log('Users loaded successfully');
    }
  });

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
