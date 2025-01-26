const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS package

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// In-memory graph data
let graphData = {
    nodes: [
        { id: 1, label: 'Node A' },
        { id: 2, label: 'Node B' }
    ],
    links: [
        { source: 1, target: 2, label: 'Edge 1' }
    ]
};

// Middleware to parse JSON
app.use(bodyParser.json());

// Get the current graph
app.get('/graph', (req, res) => {
    res.json(graphData);
});

// Add a new node
app.post('/graph/node', (req, res) => {
    const { id, label } = req.body;

    if (!id || !label) {
        return res.status(400).json({ error: "Both 'id' and 'label' are required." });
    }

    // Check for duplicate node
    if (graphData.nodes.find(node => node.id === id)) {
        return res.status(400).json({ error: "Node with this 'id' already exists." });
    }

    graphData.nodes.push({ id, label });
    res.json({ success: true, node: { id, label } });
});

// Add a new edge
app.post('/graph/edge', (req, res) => {
    const { source, target, label } = req.body;

    if (!source || !target || !label) {
        return res.status(400).json({ error: "Fields 'source', 'target', and 'label' are required." });
    }

    // Ensure both source and target nodes exist
    const sourceNode = graphData.nodes.find(node => node.id === source);
    const targetNode = graphData.nodes.find(node => node.id === target);

    if (!sourceNode || !targetNode) {
        return res.status(400).json({ error: "Both source and target nodes must exist." });
    }

    graphData.links.push({ source, target, label });
    res.json({ success: true, edge: { source, target, label } });
});

// Update a node or edge label
app.put('/graph/label', (req, res) => {
    const { id, newLabel, type } = req.body; // type: 'node' or 'edge'

    if (!id || !newLabel || !type) {
        return res.status(400).json({ error: "Fields 'id', 'newLabel', and 'type' are required." });
    }

    if (type === 'node') {
        const node = graphData.nodes.find(n => n.id === id);
        if (!node) return res.status(404).json({ error: "Node not found." });

        node.label = newLabel;
        res.json({ success: true, node });
    } else if (type === 'edge') {
        const edge = graphData.links.find(e => e.label === id);
        if (!edge) return res.status(404).json({ error: "Edge not found." });

        edge.label = newLabel;
        res.json({ success: true, edge });
    } else {
        res.status(400).json({ error: "Invalid type. Must be 'node' or 'edge'." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Graph API server running at http://localhost:${PORT}`);
});
