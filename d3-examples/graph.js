// Set up global variables
let graphData = { nodes: [], links: [] };
let scene, camera, renderer, nodeMeshes = [], edgeMeshes = [];
let raycaster, mouse, tooltipDiv;

// Fetch and load the graph data from the server
function loadGraph() {
    fetch('http://localhost:3000/graph')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load graph data');
            return response.json();
        })
        .then(data => {
            graphData = data;
            initializeGraph(); // Initialize the graph after fetching data
        })
        .catch(error => console.error('Error loading graph:', error));
}

// Initialize the graph elements (Three.js scene setup, nodes, edges)
function initializeGraph() {
    // Clear previous scene if any
    clearGraph();

    // Set up the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    tooltipDiv = document.createElement('div');
    tooltipDiv.style.position = 'absolute';
    tooltipDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipDiv.style.color = 'white';
    tooltipDiv.style.padding = '5px';
    tooltipDiv.style.display = 'none';
    document.body.appendChild(tooltipDiv);

    // Create nodes
    graphData.nodes.forEach((node, index) => {
        const geometry = new THREE.SphereGeometry(10, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200); // Randomize positions
        sphere.userData = { id: node.id, label: node.label };
        scene.add(sphere);
        nodeMeshes.push(sphere);
    });

    // Create edges (lines)
    graphData.links.forEach(link => {
        const sourceNode = nodeMeshes.find(node => node.userData.id === link.source);
        const targetNode = nodeMeshes.find(node => node.userData.id === link.target);
        const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });

        const points = [];
        points.push(sourceNode.position);
        points.push(targetNode.position);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        edgeMeshes.push(line);
    });

    // Set camera position
    camera.position.z = 500;

    // Add event listener for window resizing
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Start animation loop
    animate();
}

// Clear previous graph data (nodes and edges)
function clearGraph() {
    nodeMeshes.forEach(node => scene.remove(node));
    edgeMeshes.forEach(edge => scene.remove(edge));
    nodeMeshes = [];
    edgeMeshes = [];
}

// Handle mouse movement for tooltips
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Raycast to check for mouse hovering over nodes
function checkMouseHover() {
    raycaster.updateMatrixWorld();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(nodeMeshes);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        tooltipDiv.style.left = `${intersects[0].point.x + window.innerWidth / 2}px`;
        tooltipDiv.style.top = `${-intersects[0].point.y + window.innerHeight / 2}px`;
        tooltipDiv.style.display = 'block';
        tooltipDiv.innerHTML = `Node: ${object.userData.label}`;
    } else {
        tooltipDiv.style.display = 'none';
    }
}

// Mouse click for dragging or adding interactions
function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodeMeshes);
    if (intersects.length > 0) {
        // Handle click interaction (e.g., select a node)
        const clickedNode = intersects[0].object;
        console.log('Clicked node:', clickedNode.userData.label);
    }
}

// Animate the scene (rendering loop)
function animate() {
    requestAnimationFrame(animate);

    // Update mouse hover checks
    checkMouseHover();

    // Render the scene
    renderer.render(scene, camera);
}

// Add a new node to the graph
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
        loadGraph(); // Reload the graph after adding the node
    })
    .catch(error => console.error('Error adding node:', error));
}

// Add a new edge between nodes
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
        loadGraph(); // Reload the graph after adding the edge
    })
    .catch(error => console.error('Error adding edge:', error));
}

// Update the label of a node or edge
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
        loadGraph(); // Reload the graph after updating the label
    })
    .catch(error => console.error(`Error updating ${type} label:`, error));
}

// Set up the mouse event listeners
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('click', onMouseClick, false);

// Load the graph when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadGraph();  // Automatically load the graph data
});
