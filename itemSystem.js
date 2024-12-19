const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const admin = require('./firebaseConfig');

const firestore = admin.firestore();
const itemsCollection = firestore.collection('items');  // Firestore collection for items
const itemsJsonFilePath = path.join(__dirname, 'items.json'); // Local JSON file path

module.exports = function (app) {
    console.log('Item System server initialized successfully');

    // Endpoint to fetch all items
    app.get('/api/items', async (req, res) => {
        try {
            const snapshot = await itemsCollection.get();
            const items = snapshot.docs.map(doc => doc.data());  // Get all items from Firestore
            res.json(items);
        } catch (error) {
            console.error('Error fetching items from Firestore:', error);
            res.status(500).json({ error: 'Failed to fetch items' });
        }
    });

    // Endpoint to fetch details of a single item by itemId
    app.get('/api/items/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const doc = await itemsCollection.doc(id).get();
            if (!doc.exists) {
                return res.status(404).json({ error: 'Item not found' });
            }

            const item = doc.data();
            res.json(item);  // Return item details (including image URL)
        } catch (error) {
            console.error('Error fetching item details from Firestore:', error);
            res.status(500).json({ error: 'Failed to fetch item details' });
        }
    });

    // Function to store items both in Firestore and local JSON file
    const storeItem = async (item) => {
        const itemId = uuidv4();
        item.itemId = itemId;

        // Add the item to Firestore
        await itemsCollection.doc(itemId).set(item);

        // Read existing items from local JSON file
        fs.readFile(itemsJsonFilePath, (err, data) => {
            let items = [];
            if (err) {
                if (err.code === 'ENOENT') {
                    // If file doesn't exist, create an empty array
                    items = [];
                } else {
                    console.error('Error reading local JSON file:', err);
                    return;
                }
            } else {
                // If file exists, parse the data
                items = JSON.parse(data);
            }

            items.push(item);  // Add the new item to the local array

            // Write the updated items back to the local JSON file
            fs.writeFile(itemsJsonFilePath, JSON.stringify(items, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to local JSON file:', err);
                } else {
                    console.log('Item successfully stored in local JSON file');
                }
            });
        });
    };

    // POST endpoint to add an item
    app.post('/api/items', async (req, res) => {
        const { name, rarity, imageUrl, description, stats } = req.body;

        // Validate required fields
        if (!name || !rarity || !imageUrl || !description || !stats) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create item object with necessary fields
        const newItem = {
            name,
            rarity,
            imageUrl,
            description,
            stats,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),  // Automatically set timestamp
        };

        try {
            // Save item to Firestore and JSON file
            await storeItem(newItem);

            // Respond with the saved item and a success message
            res.status(201).json({
                message: 'Item successfully added to the system',
                item: newItem,
            });
        } catch (error) {
            console.error('Error adding item:', error);
            res.status(500).json({ error: 'Failed to add item' });
        }
    });
};
