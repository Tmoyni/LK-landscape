// Complete client HTML generator with embedded CSS and JS

async function generateCompleteClientHTML(zones, imageData, projectName) {

    // Read the actual CSS file
    const stylesResponse = await fetch('styles.css');
    const stylesCSS = await stylesResponse.text();

    // Read the plant API code
    const plantAPIResponse = await fetch('plant-api.js');
    let plantAPICode = await plantAPIResponse.text();
    // Remove export statements
    plantAPICode = plantAPICode.replace(/export\s+{[^}]+};?/g, '');
    plantAPICode = plantAPICode.replace(/export\s+(function|const|let|var)/g, '$1');

    // Generate zones JS
    const zonesJS = zones.map((zone) => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const coords = zone.points.map(p => `${p.x},${p.y}`).join(',');
        return `    '${key}': {
        coords: [${coords}],
        name: '${zone.name}'
    }`;
    }).join(',\n');

    // Generate popups HTML
    const popupsHTML = zones.map(zone => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const plantsJSON = JSON.stringify(zone.plants).replace(/'/g, "\\'");
        return `        <div class="popup ${key}">
            <span class="close">&times;</span>
            <h3>${zone.name}</h3>
            <div class="loading-message">Loading plant information...</div>
            <ul class="plant-list" data-plants='${plantsJSON}'>
            </ul>
        </div>`;
    }).join('\n\n');

    // Generate CSS classes
    const cssClasses = zones.map(zone =>
        `.${zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
    ).join(', ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
${stylesCSS}

/* Additional styles for generated zones */
${cssClasses} {
    display: none;
}
    </style>
</head>
<body>
    <div class="container">
        <h1>${projectName}</h1>

${popupsHTML}

        <div class="image-container">
            <img src="${imageData.src}" alt="Garden Plan" id="garden-image">
            <canvas id="overlay-canvas"></canvas>
        </div>

        <div class="instructions">
            <p><strong>How to use:</strong> Hover over the garden plan to see highlighted zones, then click to view plant details.</p>
            <p class="note">💡 Click on any plant name in the sidebar to see photos and more information!</p>
            <p class="note-small">Plant information and photos are loaded from the iNaturalist database.</p>
        </div>
    </div>

    <script>
// ========== PLANT API CODE ==========
${plantAPICode}

// ========== MAIN SCRIPT ==========
const popups = document.querySelectorAll(".popup");

// Store original image dimensions and zone coordinates
const ORIGINAL_WIDTH = ${imageData.width};
const ORIGINAL_HEIGHT = ${imageData.height};

// Define zones with their coordinates
const zones = {
${zonesJS}
};

// Function to check if a point is inside a polygon
function isPointInPolygon(point, polygon) {
    let x = point.x, y = point.y;
    let inside = false;

    for (let i = 0, j = polygon.length - 2; i < polygon.length; i += 2) {
        let xi = polygon[i], yi = polygon[i + 1];
        let xj = polygon[j], yj = polygon[j + 1];

        let intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;

        j = i;
    }

    return inside;
}

// Function to get scaled coordinates
function getScaledPoint(clientX, clientY, img) {
    const rect = img.getBoundingClientRect();

    // Get click position relative to image
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Scale to original image coordinates
    const scaleX = ORIGINAL_WIDTH / rect.width;
    const scaleY = ORIGINAL_HEIGHT / rect.height;

    return {
        x: x * scaleX,
        y: y * scaleY
    };
}

// Function to create enhanced plant item with API data
async function createEnhancedPlantItem(plantName) {
    const li = document.createElement('li');
    li.className = 'plant-item loading';
    li.innerHTML = \`
        <span class="plant-name">\${plantName}</span>
        <span class="loading-spinner">⏳</span>
    \`;

    // Fetch plant data from API
    try {
        const plantData = await searchPlantINaturalist(plantName);

        if (plantData && plantData.image) {
            li.className = 'plant-item loaded';
            li.innerHTML = \`
                <div class="plant-info">
                    <img src="\${plantData.image}" alt="\${plantName}" class="plant-thumb">
                    <div class="plant-details">
                        <strong class="plant-common-name">\${plantData.commonName || plantName}</strong>
                        \${plantData.scientificName ? \`<em class="plant-scientific-name">\${plantData.scientificName}</em>\` : ''}
                    </div>
                </div>
            \`;

            // Make it clickable to show more details
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => showPlantModal(plantData));
        } else {
            // Fallback if no image data
            li.className = 'plant-item';
            li.innerHTML = \`<span class="plant-name">\${plantName}</span>\`;
        }
    } catch (error) {
        console.error(\`Error loading \${plantName}:\`, error);
        // Fallback on error
        li.className = 'plant-item';
        li.innerHTML = \`<span class="plant-name">\${plantName}</span>\`;
    }

    return li;
}

// Function to load plant data into a popup
async function loadPlantData(popup) {
    const plantList = popup.querySelector('.plant-list');
    const loadingMessage = popup.querySelector('.loading-message');

    // Check if already loaded
    if (!plantList || plantList.dataset.loaded === 'true') {
        if (loadingMessage) loadingMessage.style.display = 'none';
        return;
    }

    // Show loading message
    if (loadingMessage) loadingMessage.style.display = 'block';

    // Get plant names from data attribute
    const plantNames = JSON.parse(plantList.dataset.plants);

    // Clear existing items
    plantList.innerHTML = '';

    // Create enhanced items with API data
    for (const name of plantNames) {
        const item = await createEnhancedPlantItem(name);
        plantList.appendChild(item);
    }

    // Hide loading message and mark as loaded
    if (loadingMessage) loadingMessage.style.display = 'none';
    plantList.dataset.loaded = 'true';
}

// Function to show a specific popup
function showPopup(zoneKey) {
    const popup = document.querySelector(\`.popup.\${zoneKey}\`);
    if (popup) {
        popups.forEach(p => p.classList.remove('show'));
        popup.classList.add('show');
        loadPlantData(popup);
    }
}

// Set up click handler on the image
const gardenImage = document.getElementById('garden-image');
if (gardenImage) {
    gardenImage.addEventListener('click', (e) => {
        // Get scaled point
        const point = getScaledPoint(e.clientX, e.clientY, gardenImage);

        console.log('Click detected:', {
            point: point,
            ORIGINAL_WIDTH: ORIGINAL_WIDTH,
            ORIGINAL_HEIGHT: ORIGINAL_HEIGHT,
            imageNaturalSize: { width: gardenImage.naturalWidth, height: gardenImage.naturalHeight },
            zones: Object.keys(zones)
        });

        // Debug: Show click info on page
        const debugDiv = document.getElementById('debug-info') || (() => {
            const div = document.createElement('div');
            div.id = 'debug-info';
            div.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #fff; border: 2px solid #000; padding: 10px; font-family: monospace; font-size: 12px; max-width: 300px; z-index: 10000;';
            document.body.appendChild(div);
            return div;
        })();
        debugDiv.innerHTML = \`Click: (\${Math.round(point.x)}, \${Math.round(point.y)})<br>Image: \${gardenImage.naturalWidth}x\${gardenImage.naturalHeight}<br>Expected: \${ORIGINAL_WIDTH}x\${ORIGINAL_HEIGHT}\`;

        // Check which zone was clicked
        let clickedZone = null;
        for (const [zoneKey, zone] of Object.entries(zones)) {
            const isInside = isPointInPolygon(point, zone.coords);
            console.log(\`Checking zone '\${zoneKey}': \${isInside}\`);
            debugDiv.innerHTML += \`<br>Zone '\${zoneKey}': \${isInside ? 'YES' : 'NO'}\`;
            if (isInside) {
                clickedZone = zoneKey;
                break;
            }
        }

        if (clickedZone) {
            showPopup(clickedZone);
        } else {
            // Clicked outside any zone - close popups
            popups.forEach(p => p.classList.remove('show'));
        }
    });
}

// Close button functionality
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        popups.forEach(p => p.classList.remove('show'));
    });
});

// Visual feedback for clickable regions using canvas
const canvas = document.getElementById('overlay-canvas');
const img = document.getElementById('garden-image');

if (canvas && img) {
    const ctx = canvas.getContext('2d');

    // Resize canvas to match image
    function resizeCanvas() {
        const rect = img.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    // Initial resize when image loads
    if (img.complete) {
        resizeCanvas();
    }

    img.addEventListener('load', resizeCanvas);
    window.addEventListener('resize', () => {
        resizeCanvas();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Draw zones on canvas for hover effect
    function drawZone(coords, highlight = false) {
        const rect = img.getBoundingClientRect();
        const scaleX = rect.width / ORIGINAL_WIDTH;
        const scaleY = rect.height / ORIGINAL_HEIGHT;

        ctx.beginPath();
        ctx.moveTo(coords[0] * scaleX, coords[1] * scaleY);

        for (let i = 2; i < coords.length; i += 2) {
            ctx.lineTo(coords[i] * scaleX, coords[i + 1] * scaleY);
        }

        ctx.closePath();

        if (highlight) {
            ctx.fillStyle = 'rgba(102, 45, 145, 0.3)';
            ctx.strokeStyle = 'rgba(102, 45, 145, 0.8)';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        }
    }

    // Hover effect
    img.addEventListener('mousemove', (e) => {
        const point = getScaledPoint(e.clientX, e.clientY, img);

        resizeCanvas();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Check if hovering over any zone
        for (const [zoneKey, zone] of Object.entries(zones)) {
            if (isPointInPolygon(point, zone.coords)) {
                drawZone(zone.coords, true);
                img.style.cursor = 'pointer';
                return;
            }
        }

        img.style.cursor = 'default';
    });

    img.addEventListener('mouseleave', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        img.style.cursor = 'default';
    });
}
    </script>
</body>
</html>`;
}

// Export for use in admin.js
window.generateCompleteClientHTML = generateCompleteClientHTML;
