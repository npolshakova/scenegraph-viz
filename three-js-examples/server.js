// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize with example data
let nodes = [
    {
        id: '1',
        label: 'Root Node',
        position: { x: 0, y: 0, z: 0 }, // Coordinates stored in position
        last_update_time_ns: Date.now() * 1e6, // Current time in nanoseconds
        is_active: true, // Root node is active by default
        is_predicted: false // Observed, not predicted
    },
    {
        id: '2',
        label: 'Node A',
        position: { x: -1, y: 1, z: 0 },
        last_update_time_ns: Date.now() * 1e6,
        is_active: false, // Example inactive node
        is_predicted: true // Predicted node
    },
    {
        id: '3',
        label: 'Node B',
        position: { x: 1, y: 1, z: 0 },
        last_update_time_ns: Date.now() * 1e6,
        is_active: true,
        is_predicted: false
    },
    {
        id: '4',
        label: 'Node C',
        position: { x: -1, y: -1, z: 0 },
        last_update_time_ns: Date.now() * 1e6,
        is_active: false,
        is_predicted: false
    },
    {
        id: '5',
        label: 'Node D',
        position: { x: 1, y: -1, z: 0 },
        last_update_time_ns: Date.now() * 1e6,
        is_active: true,
        is_predicted: false
    },
    {
        id: '6',
        label: 'Node E',
        position: { x: 0, y: 2, z: 1 },
        last_update_time_ns: Date.now() * 1e6,
        is_active: true,
        is_predicted: true
    },
    {
        id: '7',
        label: 'Node F',
        position: { x: 0, y: -2, z: 1 },
        last_update_time_ns: Date.now() * 1e6,
        is_active: false,
        is_predicted: true
    }
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
    const { position, label } = req.body;  // Destructure the new format with position
    const id = Date.now().toString();
    const node = {
        id,
        label,
        position,  // Position now contains x, y, z as an object
        last_update_time_ns: Date.now() * 1e6, // Set the current time in nanoseconds
        is_active: true,  // Default to active
        is_predicted: false  // Default to not predicted
    };
    nodes.push(node);  // Add the node to the nodes array
    res.json(node);  // Respond with the newly added node
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

/*
TODO:
- Display metadata (semantic label, timestamp) -> turn on/off
- Click -> display stays open to be able to copy
*/

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});