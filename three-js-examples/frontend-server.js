// frontend-server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Middleware to add CSP headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' unpkg.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' localhost:3000 unpkg.com"
    );
    next();
});

// Serve static files from 'public' directory
app.use(express.static('public'));

// Serve favicon
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});