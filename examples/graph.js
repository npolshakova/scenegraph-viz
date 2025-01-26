// Set up global variables
let graphData = { nodes: [], links: [] };
let svg, tooltip, simulation, linkGroup, nodeGroup;

// Initialize the graph
function loadGraph() {
    // Fetch the graph data from the API server
    fetch('http://localhost:3000/graph')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load graph data');
            return response.json();
        })
        .then(data => {
            graphData = data;
            initializeGraph();
        })
        .catch(error => console.error('Error loading graph:', error));
}

function initializeGraph() {
    // Clear previous SVG elements if any
    d3.select('#graph').selectAll('*').remove();

    // Set up the SVG canvas
    svg = d3.select('#graph')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight);

    tooltip = d3.select('#tooltip');

    // Set up the simulation
    simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));

    // Draw links
    linkGroup = svg.append('g')
        .attr('stroke', '#aaa')
        .selectAll('line')
        .data(graphData.links)
        .enter()
        .append('line')
        .attr('stroke-width', 2)
        .on('mouseover', (event, d) => showTooltip(event, d.label))
        .on('mouseout', hideTooltip);

    // Draw nodes
    nodeGroup = svg.append('g')
        .selectAll('circle')
        .data(graphData.nodes)
        .enter()
        .append('circle')
        .attr('r', 10)
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10]) // Assign dynamic colors
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))
        .on('mouseover', (event, d) => showTooltip(event, d.label))
        .on('mouseout', hideTooltip);

    // Update the simulation on each tick
    simulation.on('tick', () => {
        linkGroup
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        nodeGroup
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        svg.attr('width', window.innerWidth).attr('height', window.innerHeight);
        simulation.force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
        simulation.alpha(0.3).restart();
    });
}

// Add a new node
function addNode(id, label) {
    fetch('http://localhost:3000/graph/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, label })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to add node');
        return response.json();
    })
    .then(() => {
        console.log(`Node ${id} added successfully`);
        loadGraph(); // Reload the graph
    })
    .catch(error => console.error('Error adding node:', error));
}

// Add a new edge
function addEdge(source, target, label) {
    fetch('http://localhost:3000/graph/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, target, label })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to add edge');
        return response.json();
    })
    .then(() => {
        console.log(`Edge from ${source} to ${target} added successfully`);
        loadGraph(); // Reload the graph
    })
    .catch(error => console.error('Error adding edge:', error));
}

// Update a node or edge label
function updateLabel(id, newLabel, type) {
    fetch(`http://localhost:3000/graph/${type}s/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to update ${type} label`);
        return response.json();
    })
    .then(() => {
        console.log(`${type} ${id} label updated successfully`);
        loadGraph(); // Reload the graph
    })
    .catch(error => console.error(`Error updating ${type} label:`, error));
}

// Tooltip handling
function showTooltip(event, text) {
    tooltip.style('display', 'block')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px')
        .text(text);
}

function hideTooltip() {
    tooltip.style('display', 'none');
}

// Dragging behavior
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Load the graph on page load
document.addEventListener('DOMContentLoaded', () => {
    loadGraph(); // Automatically load the graph on page refresh
});