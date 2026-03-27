import { searchPlantINaturalist, showPlantModal } from './plant-api.js';

const popups = document.querySelectorAll(".popup");

// Store original image dimensions and zone coordinates
const ORIGINAL_WIDTH = 1500;   // Actual image width
const ORIGINAL_HEIGHT = 1034;  // Actual image height

// Define zones with their coordinates (from image-map.net)
const zones = {
    'succulent-garden': {
        coords: [1129,225,1192,230,1206,275,1211,356,1211,409,1184,495,1133,584,1118,587,1106,572,1106,547,1154,477,1162,435,1162,396,1167,339,1161,300,1133,274,1122,259],
        name: 'Succulent Garden Walkway'
    },
    'wildflower-meadow': {
        coords: [1329,201,1398,198,1393,656,1322,693],
        name: 'Wildflower Meadow'
    },
    'north-walkway': {
        coords: [501,230,806,238,804,283,511,280],
        name: 'North Walkway'
    },
    'south-walkway': {
        coords: [386,759,892,759,1018,755,1087,777,1092,825,481,817,481,795,453,777],
        name: 'South Walkway'
    },
    'garden-bed': {
        coords: [119,333,164,353,176,494,197,543,156,690,115,719],
        name: 'Garden Bed'
    }
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
    li.innerHTML = `
        <span class="plant-name">${plantName}</span>
        <span class="loading-spinner">⏳</span>
    `;

    // Fetch plant data from API
    try {
        const plantData = await searchPlantINaturalist(plantName);

        if (plantData && plantData.image) {
            li.className = 'plant-item loaded';
            li.innerHTML = `
                <div class="plant-info">
                    <img src="${plantData.image}" alt="${plantName}" class="plant-thumb">
                    <div class="plant-details">
                        <strong class="plant-common-name">${plantData.commonName || plantName}</strong>
                        ${plantData.scientificName ? `<em class="plant-scientific-name">${plantData.scientificName}</em>` : ''}
                    </div>
                </div>
            `;

            // Make it clickable to show more details
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => showPlantModal(plantData));
        } else {
            // Fallback if no image data
            li.className = 'plant-item';
            li.innerHTML = `<span class="plant-name">${plantName}</span>`;
        }
    } catch (error) {
        console.error(`Error loading ${plantName}:`, error);
        // Fallback on error
        li.className = 'plant-item';
        li.innerHTML = `<span class="plant-name">${plantName}</span>`;
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
    const popup = document.querySelector(`.popup.${zoneKey}`);
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

        // Check which zone was clicked
        let clickedZone = null;
        for (const [zoneKey, zone] of Object.entries(zones)) {
            if (isPointInPolygon(point, zone.coords)) {
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
