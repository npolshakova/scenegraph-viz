// frontend-server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Serve static files from 'public' directory
app.use(express.static('public'));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});