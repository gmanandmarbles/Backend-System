// firebaseConfig.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebasekey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://magicgame-b1800.firebaseio.com',
});

module.exports = admin;
