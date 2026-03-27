// Admin interface for creating interactive garden plans

let currentImage = null;
let currentImageData = null;
let canvas = null;
let ctx = null;
let zones = [];
let currentZone = null;
let isDrawing = false;

// Color palette for zones
const colors = [
    'rgba(102, 45, 145, 0.4)',  // Purple
    'rgba(76, 175, 80, 0.4)',   // Green
    'rgba(33, 150, 243, 0.4)',  // Blue
    'rgba(255, 152, 0, 0.4)',   // Orange
    'rgba(233, 30, 99, 0.4)',   // Pink
    'rgba(0, 188, 212, 0.4)',   // Cyan
    'rgba(255, 235, 59, 0.4)',  // Yellow
    'rgba(121, 85, 72, 0.4)'    // Brown
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupImageUpload();
    setupCanvasInteraction();
    setupButtons();
    setupModal();
});

// Image Upload
function setupImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-upload');

    fileInput.addEventListener('change', handleImageSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    });
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            currentImageData = {
                width: img.width,
                height: img.height,
                src: e.target.result,
                filename: file.name
            };
            displayImage();
            document.getElementById('mapping-section').style.display = 'block';
            document.getElementById('generate-section').style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayImage() {
    const container = document.getElementById('image-preview-container');
    canvas = document.getElementById('admin-canvas');
    ctx = canvas.getContext('2d');

    container.style.display = 'block';

    // Set canvas size to match image
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    drawCanvas();
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);

    // Draw all completed zones
    zones.forEach((zone, index) => {
        drawZone(zone, colors[index % colors.length]);
    });

    // Draw current zone being created
    if (currentZone && currentZone.points.length > 0) {
        drawCurrentZone();
    }
}

function drawZone(zone, color) {
    if (zone.points.length < 3) return;

    ctx.fillStyle = color;
    ctx.strokeStyle = color.replace('0.4', '0.8');
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(zone.points[0].x, zone.points[0].y);
    for (let i = 1; i < zone.points.length; i++) {
        ctx.lineTo(zone.points[i].x, zone.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw points
    zone.points.forEach(point => {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
}

function drawCurrentZone() {
    const color = colors[zones.length % colors.length];
    ctx.fillStyle = color;
    ctx.strokeStyle = color.replace('0.4', '0.8');
    ctx.lineWidth = 3;

    // Draw lines between points
    if (currentZone.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentZone.points[0].x, currentZone.points[0].y);
        for (let i = 1; i < currentZone.points.length; i++) {
            ctx.lineTo(currentZone.points[i].x, currentZone.points[i].y);
        }
        ctx.stroke();
    }

    // Draw points
    currentZone.points.forEach((point, index) => {
        ctx.fillStyle = index === 0 ? '#ff0000' : '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });
}

// Canvas Interaction
function setupCanvasInteraction() {
    document.addEventListener('click', (e) => {
        if (e.target.id !== 'admin-canvas') return;
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        console.log('Click captured:', {
            displayClick: { x: e.clientX - rect.left, y: e.clientY - rect.top },
            scaledClick: { x: Math.round(x), y: Math.round(y) },
            canvasSize: { width: canvas.width, height: canvas.height },
            displaySize: { width: rect.width, height: rect.height },
            scale: { x: canvas.width / rect.width, y: canvas.height / rect.height },
            rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
        });

        // Visual feedback: draw a small circle at the clicked point
        ctx.save();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(Math.round(x), Math.round(y), 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        currentZone.points.push({ x: Math.round(x), y: Math.round(y) });
        document.getElementById('point-count').textContent = currentZone.points.length;

        drawCanvas();
    });
}

// Buttons
function setupButtons() {
    document.getElementById('start-zone-btn').addEventListener('click', startNewZone);
    document.getElementById('complete-zone-btn').addEventListener('click', completeZone);
    document.getElementById('cancel-zone-btn').addEventListener('click', cancelZone);
    document.getElementById('clear-all-btn').addEventListener('click', clearAllZones);
    document.getElementById('preview-btn').addEventListener('click', previewClientView);
    document.getElementById('download-btn').addEventListener('click', downloadPackage);
}

function startNewZone() {
    isDrawing = true;
    currentZone = {
        points: [],
        name: '',
        plants: []
    };

    document.getElementById('start-zone-btn').style.display = 'none';
    document.getElementById('complete-zone-btn').style.display = 'inline-block';
    document.getElementById('cancel-zone-btn').style.display = 'inline-block';
    document.getElementById('current-zone-info').style.display = 'block';
    document.getElementById('point-count').textContent = '0';
}

function completeZone() {
    if (!currentZone || currentZone.points.length < 3) {
        alert('Please add at least 3 points to create a zone');
        return;
    }

    // Show modal to configure zone
    showZoneModal();
}

function cancelZone() {
    isDrawing = false;
    currentZone = null;

    document.getElementById('start-zone-btn').style.display = 'inline-block';
    document.getElementById('complete-zone-btn').style.display = 'none';
    document.getElementById('cancel-zone-btn').style.display = 'none';
    document.getElementById('current-zone-info').style.display = 'none';

    drawCanvas();
}

function clearAllZones() {
    if (!confirm('Are you sure you want to clear all zones?')) return;

    zones = [];
    updateZonesList();
    drawCanvas();
}

// Modal
function setupModal() {
    const modal = document.getElementById('zone-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const saveBtn = document.getElementById('save-zone-btn');

    closeBtn.addEventListener('click', () => hideZoneModal());
    cancelBtn.addEventListener('click', () => hideZoneModal());
    saveBtn.addEventListener('click', saveZone);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideZoneModal();
    });
}

function showZoneModal() {
    const modal = document.getElementById('zone-modal');
    document.getElementById('zone-name').value = '';
    document.getElementById('zone-plants').value = '';
    modal.style.display = 'flex';
}

function hideZoneModal() {
    document.getElementById('zone-modal').style.display = 'none';
}

function saveZone() {
    const name = document.getElementById('zone-name').value.trim();
    const plantsText = document.getElementById('zone-plants').value.trim();

    if (!name) {
        alert('Please enter a zone name');
        return;
    }

    if (!plantsText) {
        alert('Please enter at least one plant');
        return;
    }

    const plants = plantsText.split('\n').map(p => p.trim()).filter(p => p);

    currentZone.name = name;
    currentZone.plants = plants;

    zones.push(currentZone);
    updateZonesList();

    // Reset
    isDrawing = false;
    currentZone = null;

    document.getElementById('start-zone-btn').style.display = 'inline-block';
    document.getElementById('complete-zone-btn').style.display = 'none';
    document.getElementById('cancel-zone-btn').style.display = 'none';
    document.getElementById('current-zone-info').style.display = 'none';

    hideZoneModal();
    drawCanvas();
}

function updateZonesList() {
    const container = document.getElementById('zones-container');
    document.getElementById('zone-count').textContent = zones.length;

    container.innerHTML = '';

    zones.forEach((zone, index) => {
        const card = document.createElement('div');
        card.className = 'zone-card';
        card.innerHTML = `
            <span class="zone-color-indicator" style="background: ${colors[index % colors.length]}"></span>
            <h4>${zone.name}</h4>
            <p class="plant-count">${zone.plants.length} plants</p>
            <details>
                <summary>View plants</summary>
                <ul style="margin-top: 10px;">
                    ${zone.plants.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </details>
            <div class="zone-actions">
                <button class="btn btn-secondary" onclick="editZone(${index})">Edit</button>
                <button class="btn btn-danger" onclick="deleteZone(${index})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.editZone = function(index) {
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!');
};

window.deleteZone = function(index) {
    if (!confirm('Are you sure you want to delete this zone?')) return;
    zones.splice(index, 1);
    updateZonesList();
    drawCanvas();
};

async function previewClientView() {
    if (zones.length === 0) {
        alert('Please add at least one zone first');
        return;
    }

    const projectName = document.getElementById('project-name').value.trim() || 'Garden Plan';

    console.log('Generating preview with:', {
        zones: zones,
        imageData: currentImageData,
        projectName: projectName
    });

    try {
        // Generate complete HTML with embedded CSS and JS
        const html = await window.generateCompleteClientHTML(zones, currentImageData, projectName);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error generating client HTML:', error);
        alert('Error generating preview. Check console for details.');
    }
}

function downloadPackage() {
    if (zones.length === 0) {
        alert('Please add at least one zone first');
        return;
    }

    const projectName = document.getElementById('project-name').value.trim() || 'garden-plan';

    alert('Download functionality would create a ZIP file with:\n\n' +
          '- index.html (client view)\n' +
          '- Your garden plan image\n' +
          '- All CSS and JS files\n' +
          '- plant-api.js\n\n' +
          'For now, use Preview and save the HTML file.');
}

function generateClientHTML() {
    const projectName = document.getElementById('project-name').value.trim() || 'Garden Plan';

    // Convert zones to JavaScript format
    const zonesJS = zones.map((zone, index) => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-');
        const coords = zone.points.map(p => `${p.x},${p.y}`).join(',');
        return `    '${key}': {
        coords: [${coords}],
        name: '${zone.name}'
    }`;
    }).join(',\n');

    const popupsHTML = zones.map(zone => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-');
        const plantsJSON = JSON.stringify(zone.plants);
        return `        <div class="popup ${key}">
            <span class="close">&times;</span>
            <h3>${zone.name}</h3>
            <div class="loading-message">Loading plant information...</div>
            <ul class="plant-list" data-plants='${plantsJSON}'>
            </ul>
        </div>`;
    }).join('\n\n');

    const zoneKeys = zones.map(zone => `'${zone.name.toLowerCase().replace(/\s+/g, '-')}'`).join(',\n        ');

    const cssClasses = zones.map(zone => `.${zone.name.toLowerCase().replace(/\s+/g, '-')}`).join(', ');

    // Note: This is a simplified version. In production, you'd need to include all the CSS and JS files
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        /* Include styles.css content here */
        /* For demo purposes, showing structure */
    </style>
</head>
<body>
    <div class="container">
        <h1>${projectName}</h1>

${popupsHTML}

        <div class="image-container">
            <img src="${currentImageData.src}" alt="Garden Plan" id="garden-image">
            <canvas id="overlay-canvas"></canvas>
        </div>
    </div>

    <script type="module">
    // Include plant-api.js functionality here

    const ORIGINAL_WIDTH = ${currentImageData.width};
    const ORIGINAL_HEIGHT = ${currentImageData.height};

    const zones = {
${zonesJS}
    };

    // Include script.js logic here
    // (Point-in-polygon, click detection, etc.)
    </script>
</body>
</html>`;
}
