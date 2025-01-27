// public/js/visualization.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const API_URL = 'http://localhost:3000/api';

// Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera position
camera.position.z = 5;

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Add smooth damping
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI; // Allow full vertical rotation

// Store node meshes and edges
const nodeMeshes = new Map();
const edgeLines = new Map();
const tooltip = document.getElementById('tooltip');

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Create node mesh
function createNodeMesh(node) {
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshPhongMaterial({ 
        color: node.id === '1' ? 0xff0000 : 0x00ff00,
        shininess: 100 
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(node.position.x, node.position.y, node.position.z);
    mesh.userData = node;
    return mesh;
}

// Create edge line
function createEdgeLine(source, target) {
    const points = [
        new THREE.Vector3(source.x, source.y, source.z),
        new THREE.Vector3(target.x, target.y, target.z)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x4444ff,
        opacity: 0.6,
        transparent: true
    });
    return new THREE.Line(geometry, material);
}

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Fetch and render nodes
async function fetchAndRenderNodes() {
    try {
        const response = await fetch(`${API_URL}/nodes`);
        const nodes = await response.json();
        
        nodes.forEach(node => {
            if (!nodeMeshes.has(node.id)) {
                const mesh = createNodeMesh(node);
                nodeMeshes.set(node.id, mesh);
                scene.add(mesh);
            }
        });
    } catch (error) {
        console.error('Error fetching nodes:', error);
    }
}

// Fetch and render edges
async function fetchAndRenderEdges() {
    try {
        const response = await fetch(`${API_URL}/edges`);
        const edges = await response.json();
        
        edges.forEach(edge => {
            if (!edgeLines.has(edge.id)) {
                const sourceMesh = nodeMeshes.get(edge.sourceId);
                const targetMesh = nodeMeshes.get(edge.targetId);
                if (sourceMesh && targetMesh) {
                    const line = createEdgeLine(
                        sourceMesh.position,
                        targetMesh.position
                    );
                    edgeLines.set(edge.id, line);
                    scene.add(line);
                }
            }
        });
    } catch (error) {
        console.error('Error fetching edges:', error);
    }
}

// Track tooltip visibility
let tooltipLocked = false;

// Handle mouse move for hover effect
function onMouseMove(event) {
    if (!controls.enabled || tooltipLocked) return; // Ignore hover if tooltip is locked

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...nodeMeshes.values()]);

    if (intersects.length > 0) {
        const node = intersects[0].object.userData;
        showTooltip(event, node.label);
    } else {
        hideTooltip();
    }
}

// Handle mouse click for locking the tooltip
function onMouseClick(event) {
    if (!controls.enabled) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...nodeMeshes.values()]);

    if (intersects.length > 0) {
        const node = intersects[0].object.userData;
        
        let text = `${node.label}
        <br>
        Last Update Time: ${node.last_update_time_ns}
        <br>
        Active: ${node.is_active}
        <br>
        Predicted: ${node.is_predicted}`;

        showTooltip(event, text);
        tooltipLocked = true; // Lock the tooltip
    }
}

// Handle double click for hiding the tooltip
function onMouseDoubleClick(event) {
    if (!controls.enabled) return;

    hideTooltip();
    tooltipLocked = false; // Unlock the tooltip
}

// Utility function to show the tooltip
function showTooltip(event, text) {
    tooltip.style.display = 'block';
    tooltip.style.left = event.clientX + 10 + 'px';
    tooltip.style.top = event.clientY + 10 + 'px';
    tooltip.innerHTML = text;
}

// Utility function to hide the tooltip
function hideTooltip() {
    tooltip.style.display = 'none';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required for damping
    renderer.render(scene, camera);
}

// Initialize
async function init() {
    await fetchAndRenderNodes();
    await fetchAndRenderEdges();
    animate();
}

// Event listeners
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onMouseClick);
window.addEventListener('dblclick', onMouseDoubleClick);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the visualization
init();