const admin = require('./firebaseConfig');
const { v4: uuidv4 } = require('uuid');
const firestore = admin.firestore();
const itemsCollection = firestore.collection('items');  // Firestore collection for items
const chestsCollection = firestore.collection('chests');  // Firestore collection for chests

module.exports = function (app) {
    console.log('Chest System server initialized successfully');

    // Endpoint to fetch a chest by chest ID
    app.get('/api/chests/:id', async (req, res) => {
        const chestId = req.params.id;
        console.log(`Received request for chest ID: ${chestId}`);

        try {
            // Try to fetch the chest from Firestore
            console.log(`Checking if chest with ID ${chestId} exists in Firestore...`);
            const chestDoc = await chestsCollection.doc(chestId).get();

            if (chestDoc.exists) {
                // If chest already exists, return it
                console.log(`Chest with ID ${chestId} found in Firestore. Returning chest...`);
                const chest = chestDoc.data();
                return res.json(chest);
            } else {
                // If chest doesn't exist, create a new one
                console.log(`Chest with ID ${chestId} does not exist. Generating new chest...`);
                const newChest = await generateChest(chestId);
                console.log(`New chest with ID ${chestId} generated and saved.`);
                return res.json(newChest);
            }
        } catch (error) {
            console.error(`Error fetching chest with ID ${chestId}:`, error);
            res.status(500).json({ error: 'Failed to fetch chest' });
        }
    });

    // Function to generate a new chest with random items
    const generateChest = async (chestId) => {
        try {
            console.log(`Generating new chest with ID ${chestId}...`);

            // Fetch all items from the item system
            console.log('Fetching all items from Firestore...');
            const snapshot = await itemsCollection.get();
            const items = snapshot.docs.map(doc => doc.data());
            console.log(`Fetched ${items.length} items from Firestore.`);

            // Select a random set of items to be included in this chest (adjust the number of items as needed)
            const randomItems = selectRandomItems(items, 3);  // Adjust '3' to the number of items you want per chest
            console.log(`Selected ${randomItems.length} random items for the chest.`);

            // Create a new chest object
            const newChest = {
                chestId: chestId,
                items: randomItems,
                createdAt: new Date().toISOString()
            };

            // Save the chest to Firestore
            console.log(`Saving new chest with ID ${chestId} to Firestore...`);
            await chestsCollection.doc(chestId).set(newChest);

            return newChest;
        } catch (error) {
            console.error('Error generating chest:', error);
            throw new Error('Failed to generate chest');
        }
    };

    // Function to select a random set of items from the list of all items
    const selectRandomItems = (items, count) => {
        console.log(`Selecting ${count} random items from the list of available items...`);
        const selectedItems = [];
        const usedIndices = new Set();

        while (selectedItems.length < count) {
            const randomIndex = Math.floor(Math.random() * items.length);

            if (!usedIndices.has(randomIndex)) {
                selectedItems.push(items[randomIndex]);
                usedIndices.add(randomIndex);
            }
        }

        console.log(`Random items selected: ${selectedItems.map(item => item.name).join(', ')}`);
        return selectedItems;
    };

    // New Endpoint: Get the range of all chest IDs (separate from /api/chests)
    app.get('/api/chestnumbers', async (req, res) => {
        console.log('Received request for chest ID range');

        try {
            // Fetch all chest documents from Firestore
            console.log('Fetching all chest IDs from Firestore...');
            const snapshot = await chestsCollection.get();

            // Extract the chest IDs
            const chestIds = snapshot.docs.map(doc => doc.id);
            console.log(`Found ${chestIds.length} chests in Firestore.`);

            // Return the list of chest IDs as a range
            const chestRange = {
                min: Math.min(...chestIds),
                max: Math.max(...chestIds),
                chestIds: chestIds
            };
            console.log(`Returning chest ID range: ${JSON.stringify(chestRange)}`);

            res.json(chestRange);
        } catch (error) {
            console.error('Error fetching chest IDs from Firestore:', error);
            res.status(500).json({ error: 'Failed to fetch chest IDs' });
        }
    });
};
