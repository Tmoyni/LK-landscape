import { searchPlantINaturalist, showPlantModal } from './plant-api.js';

// ── Helpers ──────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// CRS.Simple is Y-up (cartesian). Image coords are Y-down.
// So we need to invert Y: [imageHeight - y, x]
let _imageHeight = 0; // set during init

function coordsToLatLng(flatCoords) {
    const pairs = [];
    for (let i = 0; i < flatCoords.length; i += 2) {
        pairs.push([_imageHeight - flatCoords[i + 1], flatCoords[i]]); // [H - y, x]
    }
    return pairs;
}

// ── Load zone data and build the page ────────────────────
async function init() {
    let data;
    try {
        const res = await fetch('zones.json');
        if (!res.ok) throw new Error(`Failed to load zones.json: ${res.status}`);
        data = await res.json();
    } catch (e) {
        console.error(e);
        document.getElementById('page-title').textContent = 'Error loading garden plan data.';
        return;
    }

    const { projectName, imageWidth, imageHeight, imageSrc, zones } = data;
    _imageHeight = imageHeight;

    // Set page title
    document.getElementById('page-title').textContent = projectName;
    document.title = projectName;

    // ── Build popup HTML and nav buttons ─────────────────
    const popupsContainer = document.getElementById('popups-container');
    const zoneNav = document.getElementById('zone-nav');

    for (const [key, zone] of Object.entries(zones)) {
        // Nav button
        const btn = document.createElement('button');
        btn.className = 'zone-pill';
        btn.dataset.zone = key;
        btn.textContent = zone.name;
        zoneNav.appendChild(btn);

        // Popup panel
        const popup = document.createElement('div');
        popup.className = `popup ${key}`;
        popup.setAttribute('role', 'complementary');
        popup.setAttribute('aria-label', `${zone.name} plants`);
        popup.innerHTML = `
            <span class="close" aria-label="Close panel">&times;</span>
            <h3>${escapeHtml(zone.name)}</h3>
            <div class="loading-message">Loading plant information...</div>
            <ul class="plant-list" data-plants='${JSON.stringify(zone.plants)}'></ul>
        `;
        popupsContainer.appendChild(popup);
    }

    // ── Leaflet Map ─────────────────────────────────────
    const bounds = [[0, 0], [imageHeight, imageWidth]];

    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    });

    L.imageOverlay(imageSrc, bounds).addTo(map);
    map.fitBounds(bounds);

    // ── Zone Polygons ───────────────────────────────────
    const defaultStyle = {
        color: 'rgba(40, 53, 41, 0.4)',
        weight: 2,
        fillColor: 'rgba(40, 53, 41, 0.05)',
        fillOpacity: 1
    };
    const hoverStyle = {
        fillColor: 'rgba(201, 125, 74, 0.25)',
        fillOpacity: 1,
        color: 'rgba(201, 125, 74, 0.8)',
        weight: 2
    };
    const activeStyle = {
        fillColor: 'rgba(201, 125, 74, 0.3)',
        fillOpacity: 1,
        color: 'rgba(201, 125, 74, 0.9)',
        weight: 3
    };

    const polygonLayers = {};
    let activeZoneKey = null;

    for (const [key, zone] of Object.entries(zones)) {
        const latlngs = coordsToLatLng(zone.coords);
        const polygon = L.polygon(latlngs, defaultStyle).addTo(map);

        polygon.on('click', () => showPopup(key));
        polygon.on('mouseover', () => {
            if (activeZoneKey !== key) polygon.setStyle(hoverStyle);
        });
        polygon.on('mouseout', () => {
            if (activeZoneKey !== key) polygon.setStyle(defaultStyle);
        });

        polygonLayers[key] = polygon;
    }

    // ── Popups / Panels ─────────────────────────────────
    const popups = popupsContainer.querySelectorAll('.popup');

    function showPopup(zoneKey) {
        if (activeZoneKey && polygonLayers[activeZoneKey]) {
            polygonLayers[activeZoneKey].setStyle(defaultStyle);
        }
        popups.forEach(p => p.classList.remove('show'));

        const popup = popupsContainer.querySelector(`.popup.${zoneKey}`);
        if (popup) {
            popup.classList.add('show');
            loadPlantData(popup);
            activeZoneKey = zoneKey;
            polygonLayers[zoneKey].setStyle(activeStyle);

            document.querySelectorAll('.zone-pill').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.zone === zoneKey);
            });
            document.getElementById('backdrop').classList.add('show');
        }
    }

    function closeAllPopups() {
        popups.forEach(p => p.classList.remove('show'));
        document.getElementById('backdrop').classList.remove('show');
        document.querySelectorAll('.zone-pill').forEach(btn => btn.classList.remove('active'));
        if (activeZoneKey && polygonLayers[activeZoneKey]) {
            polygonLayers[activeZoneKey].setStyle(defaultStyle);
        }
        activeZoneKey = null;
    }

    // Close buttons (delegated since popups are dynamic)
    popupsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('close')) closeAllPopups();
    });
    document.getElementById('backdrop').addEventListener('click', closeAllPopups);

    // ── Zone Nav ────────────────────────────────────────
    zoneNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.zone-pill');
        if (!btn) return;
        const zoneKey = btn.dataset.zone;
        showPopup(zoneKey);
        if (polygonLayers[zoneKey]) {
            map.panTo(polygonLayers[zoneKey].getBounds().getCenter());
        }
    });

    zoneNav.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('.zone-pill');
        if (!btn) return;
        const zoneKey = btn.dataset.zone;
        if (activeZoneKey !== zoneKey && polygonLayers[zoneKey]) {
            polygonLayers[zoneKey].setStyle(hoverStyle);
        }
    });

    zoneNav.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('.zone-pill');
        if (!btn) return;
        const zoneKey = btn.dataset.zone;
        if (activeZoneKey !== zoneKey && polygonLayers[zoneKey]) {
            polygonLayers[zoneKey].setStyle(defaultStyle);
        }
    });

    // ── First-Visit Hint ────────────────────────────────
    for (const polygon of Object.values(polygonLayers)) {
        polygon.setStyle({ fillColor: 'rgba(201, 125, 74, 0.2)', fillOpacity: 1 });
    }

    const hint = document.createElement('div');
    hint.className = 'first-visit-hint';
    hint.textContent = 'Tap a colored area to see plants, or use the zone list below.';
    document.getElementById('map').appendChild(hint);

    const dismiss = () => {
        hint.classList.add('fade-out');
        setTimeout(() => hint.remove(), 300);
        for (const [k, polygon] of Object.entries(polygonLayers)) {
            if (k !== activeZoneKey) polygon.setStyle(defaultStyle);
        }
        map.off('click', dismiss);
    };

    setTimeout(() => map.on('click', dismiss), 100);
    zoneNav.addEventListener('click', dismiss, { once: true });
    setTimeout(dismiss, 5000);
}

// ── Plant Data Loading ───────────────────────────────────
async function loadPlantData(popup) {
    const plantList = popup.querySelector('.plant-list');
    const loadingMessage = popup.querySelector('.loading-message');

    if (!plantList || plantList.dataset.loaded === 'true') {
        if (loadingMessage) loadingMessage.style.display = 'none';
        return;
    }

    let plantNames;
    try {
        plantNames = JSON.parse(plantList.dataset.plants);
    } catch (e) {
        console.error('Failed to parse plant data:', e);
        if (loadingMessage) loadingMessage.textContent = 'Could not load plant information.';
        return;
    }

    plantList.innerHTML = '';

    // Show skeleton cards immediately
    const skeletonItems = plantNames.map(() => {
        const li = document.createElement('li');
        li.className = 'plant-item skeleton';
        li.innerHTML = `
            <div class="plant-info">
                <div class="plant-thumb-skeleton"></div>
                <div class="plant-details">
                    <div class="skeleton-text skeleton-text-name"></div>
                    <div class="skeleton-text skeleton-text-sci"></div>
                </div>
            </div>
        `;
        plantList.appendChild(li);
        return li;
    });

    if (loadingMessage) loadingMessage.style.display = 'none';

    const results = await Promise.allSettled(
        plantNames.map(name => searchPlantINaturalist(name))
    );

    results.forEach((result, i) => {
        const li = skeletonItems[i];
        const plantName = plantNames[i];

        if (result.status === 'fulfilled' && result.value && result.value.image) {
            const plantData = result.value;
            const safeName = escapeHtml(plantData.commonName || plantName);
            const safeSciName = escapeHtml(plantData.scientificName || '');
            li.className = 'plant-item loaded';
            li.innerHTML = `
                <div class="plant-info">
                    <img src="${escapeHtml(plantData.image)}" alt="${safeName}" class="plant-thumb"
                         onerror="this.style.display='none'">
                    <div class="plant-details">
                        <strong class="plant-common-name">${safeName}</strong>
                        ${safeSciName ? `<em class="plant-scientific-name">${safeSciName}</em>` : ''}
                    </div>
                </div>
            `;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => showPlantModal(plantData));
        } else {
            li.className = 'plant-item';
            li.innerHTML = `<span class="plant-name">${escapeHtml(plantName)}</span>`;
        }
    });

    plantList.dataset.loaded = 'true';
}

// ── Start ────────────────────────────────────────────────
init();
