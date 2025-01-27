// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize with example data
let nodes = [
    { id: '1', x: 0, y: 0, z: 0, label: 'Root Node' },
    { id: '2', x: -1, y: 1, z: 0, label: 'Node A' },
    { id: '3', x: 1, y: 1, z: 0, label: 'Node B' },
    { id: '4', x: -1, y: -1, z: 0, label: 'Node C' },
    { id: '5', x: 1, y: -1, z: 0, label: 'Node D' },
    { id: '6', x: 0, y: 2, z: 1, label: 'Node E' },
    { id: '7', x: 0, y: -2, z: 1, label: 'Node F' }
];

let edges = [
    { id: 'e1', sourceId: '1', targetId: '2' },
    { id: 'e2', sourceId: '1', targetId: '3' },
    { id: 'e3', sourceId: '1', targetId: '4' },
    { id: 'e4', sourceId: '1', targetId: '5' },
    { id: 'e5', sourceId: '2', targetId: '6' },
    { id: 'e6', sourceId: '3', targetId: '6' },
    { id: 'e7', sourceId: '4', targetId: '7' },
    { id: 'e8', sourceId: '5', targetId: '7' }
];

// Add node endpoint
app.post('/api/nodes', (req, res) => {
    const { x, y, z, label } = req.body;
    const id = Date.now().toString();
    const node = { id, x, y, z, label };
    nodes.push(node);
    res.json(node);
});

// Add edge endpoint
app.post('/api/edges', (req, res) => {
    const { sourceId, targetId } = req.body;
    const id = Date.now().toString();
    const edge = { id, sourceId, targetId };
    edges.push(edge);
    res.json(edge);
});

// Get all nodes
app.get('/api/nodes', (req, res) => {
    res.json(nodes);
});

// Get all edges
app.get('/api/edges', (req, res) => {
    res.json(edges);
});

// Delete node endpoint
app.delete('/api/nodes/:id', (req, res) => {
    const { id } = req.params;
    nodes = nodes.filter(node => node.id !== id);
    edges = edges.filter(edge => edge.sourceId !== id && edge.targetId !== id);
    res.json({ success: true });
});

// Delete edge endpoint
app.delete('/api/edges/:id', (req, res) => {
    const { id } = req.params;
    edges = edges.filter(edge => edge.id !== id);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});