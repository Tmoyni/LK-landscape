// Admin interface for creating interactive garden plans (Leaflet-draw version)

let adminMap = null;
let imageOverlay = null;
let drawnItems = null;
let drawControl = null;
let imageData = null;
let pendingLayer = null;

const zones = []; // { name, plants, layer, coords }

const zoneColors = [
    '#C97D4A', '#4c8750', '#3B82F6', '#E67E22',
    '#9B59B6', '#1ABC9C', '#F1C40F', '#795548'
];

// ── Image Upload ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-upload');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) loadImage(e.target.files[0]);
    });

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
        if (file && file.type.startsWith('image/')) loadImage(file);
    });

    // Modal
    document.getElementById('save-zone-btn').addEventListener('click', saveZone);
    document.getElementById('cancel-modal-btn').addEventListener('click', cancelZoneModal);
    document.querySelector('.admin-modal-close').addEventListener('click', cancelZoneModal);
    document.getElementById('zone-modal').addEventListener('click', (e) => {
        if (e.target.id === 'zone-modal') cancelZoneModal();
    });

    // Export buttons
    document.getElementById('export-json-btn').addEventListener('click', saveZonesJson);
    document.getElementById('preview-btn').addEventListener('click', previewClientView);
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            imageData = {
                width: img.width,
                height: img.height,
                src: e.target.result,
                filename: file.name
            };
            initMap(img, e.target.result);
            document.getElementById('upload-area').style.display = 'none';
            document.getElementById('map-container').style.display = 'block';
            document.getElementById('mapping-section').style.display = 'block';
            document.getElementById('generate-section').style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ── Leaflet Map Setup ────────────────────────────────────
function initMap(img, src) {
    const bounds = [[0, 0], [img.height, img.width]];

    adminMap = L.map('admin-map', {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 3,
        zoomControl: true,
        attributionControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        zoomAnimation: false
    });

    imageOverlay = L.imageOverlay(src, bounds).addTo(adminMap);

    // Container was hidden, so Leaflet needs a size recalc before fitBounds works
    setTimeout(() => {
        adminMap.invalidateSize();
        adminMap.fitBounds(bounds);
    }, 100);

    // Drawn items layer
    drawnItems = new L.FeatureGroup();
    adminMap.addLayer(drawnItems);

    // Draw control with polygon tool
    drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: {
                    color: zoneColors[zones.length % zoneColors.length],
                    weight: 3,
                    fillOpacity: 0.3
                }
            },
            polyline: false,
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    adminMap.addControl(drawControl);

    // When a polygon is drawn, hold the current view and show config modal
    adminMap.on(L.Draw.Event.CREATED, (e) => {
        // Snapshot the view BEFORE adding the layer
        const c = adminMap.getCenter();
        const z = adminMap.getZoom();

        pendingLayer = e.layer;
        drawnItems.addLayer(pendingLayer);

        // Force view back immediately and after a tick (catches async reflows)
        adminMap.setView(c, z, { animate: false });
        requestAnimationFrame(() => {
            adminMap.setView(c, z, { animate: false });
        });

        showZoneModal();
    });

    // When a polygon is deleted via the edit toolbar
    adminMap.on(L.Draw.Event.DELETED, (e) => {
        e.layers.eachLayer((layer) => {
            const idx = zones.findIndex(z => z.layer === layer);
            if (idx !== -1) zones.splice(idx, 1);
        });
        updateZonesList();
    });
}

// ── Zone Modal ───────────────────────────────────────────
function showZoneModal() {
    document.getElementById('zone-name').value = '';
    document.getElementById('zone-plants').value = '';
    document.getElementById('zone-modal').style.display = 'flex';
    document.getElementById('zone-name').focus();
}

function cancelZoneModal() {
    document.getElementById('zone-modal').style.display = 'none';
    // Remove the pending layer if user cancels
    if (pendingLayer) {
        drawnItems.removeLayer(pendingLayer);
        pendingLayer = null;
    }
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

    // Extract flat coords from the Leaflet polygon [x1,y1,x2,y2,...]
    // Leaflet CRS.Simple is Y-up, image coords are Y-down, so invert: y = imageHeight - lat
    const latlngs = pendingLayer.getLatLngs()[0]; // outer ring
    const flatCoords = [];
    for (const ll of latlngs) {
        flatCoords.push(Math.round(ll.lng));                    // x = lng
        flatCoords.push(Math.round(imageData.height - ll.lat)); // y = imageHeight - lat
    }

    const color = zoneColors[zones.length % zoneColors.length];
    pendingLayer.setStyle({
        color: color,
        fillColor: color,
        fillOpacity: 0.25,
        weight: 3
    });

    // Bind a tooltip with the zone name
    pendingLayer.bindTooltip(name, {
        permanent: true,
        direction: 'center',
        className: 'zone-label'
    });

    zones.push({
        name: name,
        plants: plants,
        layer: pendingLayer,
        coords: flatCoords
    });

    pendingLayer = null;
    document.getElementById('zone-modal').style.display = 'none';
    updateZonesList();
}

// ── Zones List ───────────────────────────────────────────
function updateZonesList() {
    const container = document.getElementById('zones-container');
    document.getElementById('zone-count').textContent = zones.length;
    container.innerHTML = '';

    zones.forEach((zone, index) => {
        const color = zoneColors[index % zoneColors.length];
        const card = document.createElement('div');
        card.className = 'zone-card';
        card.innerHTML = `
            <span class="zone-color-indicator" style="background: ${color}"></span>
            <h4>${zone.name}</h4>
            <p class="plant-count">${zone.plants.length} plants</p>
            <details>
                <summary>View plants</summary>
                <ul style="margin-top: 10px;">
                    ${zone.plants.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </details>
            <details>
                <summary>View coordinates</summary>
                <code style="font-size: 11px; word-break: break-all; display: block; margin-top: 8px;">
                    [${zone.coords.join(',')}]
                </code>
            </details>
            <div class="zone-actions">
                <button class="btn btn-secondary" onclick="focusZone(${index})">Focus</button>
                <button class="btn btn-danger" onclick="deleteZone(${index})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.focusZone = function(index) {
    const zone = zones[index];
    if (zone && zone.layer) {
        adminMap.fitBounds(zone.layer.getBounds().pad(0.3));
    }
};

window.deleteZone = function(index) {
    if (!confirm(`Delete zone "${zones[index].name}"?`)) return;
    drawnItems.removeLayer(zones[index].layer);
    zones.splice(index, 1);
    updateZonesList();
};

// ── Save zones.json ──────────────────────────────────────
async function saveZonesJson() {
    if (zones.length === 0) {
        alert('Please add at least one zone first');
        return;
    }

    const projectName = document.getElementById('project-name').value.trim() || 'Garden Plan';

    const zonesObj = {};
    zones.forEach(zone => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        zonesObj[key] = {
            coords: zone.coords,
            name: zone.name,
            plants: zone.plants
        };
    });

    const data = {
        projectName: projectName,
        imageWidth: imageData.width,
        imageHeight: imageData.height,
        imageSrc: imageData.filename || 'garden-plan.webp',
        zones: zonesObj
    };

    const json = JSON.stringify(data, null, 4);

    // Show preview
    document.getElementById('export-output').style.display = 'block';
    document.getElementById('export-code').textContent = json;

    const btn = document.getElementById('export-json-btn');

    // Try save server first, fall back to download
    try {
        const res = await fetch('http://localhost:3001/save-zones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json
        });
        if (res.ok) {
            btn.textContent = 'Saved! Refresh client to see changes.';
            setTimeout(() => { btn.textContent = 'Save zones.json'; }, 3000);
            return;
        }
    } catch (e) {
        // Save server not running, fall back to download
    }

    // Fallback: download the file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zones.json';
    a.click();
    URL.revokeObjectURL(url);

    btn.textContent = 'Downloaded! Move to project folder.';
    setTimeout(() => { btn.textContent = 'Save zones.json'; }, 3000);
}

// ── Preview ──────────────────────────────────────────────
function previewClientView() {
    if (zones.length === 0) {
        alert('Please add at least one zone first');
        return;
    }

    const projectName = document.getElementById('project-name').value.trim() || 'Garden Plan';

    // Build zone data
    const zonesJS = zones.map(zone => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `    '${key}': {\n        coords: [${zone.coords.join(',')}],\n        name: '${zone.name}'\n    }`;
    }).join(',\n');

    const popupsHTML = zones.map(zone => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const plantsJSON = JSON.stringify(zone.plants);
        return `        <div class="popup ${key}" role="complementary">
            <span class="close">&times;</span>
            <h3>${zone.name}</h3>
            <div class="loading-message">Loading plant information...</div>
            <ul class="plant-list" data-plants='${plantsJSON}'></ul>
        </div>`;
    }).join('\n');

    const navButtons = zones.map(zone => {
        const key = zone.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `            <button class="zone-pill" data-zone="${key}">${zone.name}</button>`;
    }).join('\n');

    // Generate a self-contained preview HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>${getPreviewCSS()}</style>
</head>
<body>
    <div class="container">
        <h1>${projectName}</h1>
        <div id="map"></div>
        <nav class="zone-nav" aria-label="Garden zones">
${navButtons}
        </nav>
${popupsHTML}
        <div class="bottom-sheet-backdrop" id="backdrop"></div>
        <div class="instructions">
            <p><strong>How to use:</strong> Tap a zone on the map or click a zone name above to see plant details.</p>
        </div>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
    <script>
    // Plant API (inline)
    const plantCache = new Map();
    async function searchPlantINaturalist(plantName) {
        if (plantCache.has(plantName)) return plantCache.get(plantName);
        try {
            const r = await fetch('https://api.inaturalist.org/v1/taxa?q=' + encodeURIComponent(plantName) + '&rank=species');
            if (!r.ok) throw new Error('API error');
            const data = await r.json();
            if (data.results && data.results.length > 0) {
                const t = data.results[0];
                const info = { id: t.id, commonName: t.preferred_common_name, scientificName: t.name, image: t.default_photo?.medium_url || '', wikipediaUrl: t.wikipedia_url };
                plantCache.set(plantName, info);
                return info;
            }
            return null;
        } catch(e) { console.error(e); return null; }
    }
    function escapeHtml(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // Zones
    const IMAGE_WIDTH = ${imageData.width};
    const IMAGE_HEIGHT = ${imageData.height};
    const zones = {
${zonesJS}
    };
    function coordsToLatLng(fc) { const p=[]; for(let i=0;i<fc.length;i+=2) p.push([fc[i+1],fc[i]]); return p; }

    // Map
    const bounds = [[0,0],[IMAGE_HEIGHT,IMAGE_WIDTH]];
    const map = L.map('map',{crs:L.CRS.Simple,minZoom:-2,maxZoom:2,zoomControl:false,attributionControl:false,scrollWheelZoom:false,maxBounds:bounds,maxBoundsViscosity:1.0});
    L.imageOverlay('${imageData.src}',bounds).addTo(map);
    map.fitBounds(bounds);

    const defaultStyle={color:'rgba(40,53,41,0.4)',weight:2,fillColor:'rgba(40,53,41,0.05)',fillOpacity:1};
    const hoverStyle={fillColor:'rgba(201,125,74,0.25)',fillOpacity:1,color:'rgba(201,125,74,0.8)',weight:2};
    const activeStyle={fillColor:'rgba(201,125,74,0.3)',fillOpacity:1,color:'rgba(201,125,74,0.9)',weight:3};
    const polygonLayers={};
    let activeZoneKey=null;

    for(const [k,z] of Object.entries(zones)){
        const p=L.polygon(coordsToLatLng(z.coords),defaultStyle).addTo(map);
        p.on('click',()=>showPopup(k));
        p.on('mouseover',()=>{if(activeZoneKey!==k)p.setStyle(hoverStyle)});
        p.on('mouseout',()=>{if(activeZoneKey!==k)p.setStyle(defaultStyle)});
        polygonLayers[k]=p;
    }

    // Popups
    const popups=document.querySelectorAll('.popup');
    function showPopup(zk){
        if(activeZoneKey&&polygonLayers[activeZoneKey])polygonLayers[activeZoneKey].setStyle(defaultStyle);
        popups.forEach(p=>p.classList.remove('show'));
        const pp=document.querySelector('.popup.'+zk);
        if(pp){pp.classList.add('show');loadPlantData(pp);activeZoneKey=zk;polygonLayers[zk].setStyle(activeStyle);
        document.querySelectorAll('.zone-pill').forEach(b=>b.classList.toggle('active',b.dataset.zone===zk));
        document.getElementById('backdrop').classList.add('show');}
    }
    function closeAll(){popups.forEach(p=>p.classList.remove('show'));document.getElementById('backdrop').classList.remove('show');
        document.querySelectorAll('.zone-pill').forEach(b=>b.classList.remove('active'));
        if(activeZoneKey&&polygonLayers[activeZoneKey])polygonLayers[activeZoneKey].setStyle(defaultStyle);activeZoneKey=null;}
    document.querySelectorAll('.close').forEach(b=>b.addEventListener('click',closeAll));
    document.getElementById('backdrop').addEventListener('click',closeAll);

    document.querySelectorAll('.zone-pill').forEach(b=>{
        b.addEventListener('click',()=>{showPopup(b.dataset.zone);if(polygonLayers[b.dataset.zone])map.panTo(polygonLayers[b.dataset.zone].getBounds().getCenter())});
        b.addEventListener('mouseenter',()=>{const z=b.dataset.zone;if(activeZoneKey!==z&&polygonLayers[z])polygonLayers[z].setStyle(hoverStyle)});
        b.addEventListener('mouseleave',()=>{const z=b.dataset.zone;if(activeZoneKey!==z&&polygonLayers[z])polygonLayers[z].setStyle(defaultStyle)});
    });

    async function loadPlantData(popup){
        const pl=popup.querySelector('.plant-list');const lm=popup.querySelector('.loading-message');
        if(!pl||pl.dataset.loaded==='true'){if(lm)lm.style.display='none';return;}
        let names;try{names=JSON.parse(pl.dataset.plants)}catch(e){if(lm)lm.textContent='Error loading plants.';return;}
        pl.innerHTML='';
        names.forEach(()=>{const li=document.createElement('li');li.className='plant-item skeleton';
            li.innerHTML='<div class="plant-info"><div class="plant-thumb-skeleton"></div><div class="plant-details"><div class="skeleton-text skeleton-text-name"></div><div class="skeleton-text skeleton-text-sci"></div></div></div>';
            pl.appendChild(li)});
        if(lm)lm.style.display='none';
        const results=await Promise.allSettled(names.map(n=>searchPlantINaturalist(n)));
        const lis=pl.querySelectorAll('.plant-item');
        results.forEach((r,i)=>{const li=lis[i];const n=names[i];
            if(r.status==='fulfilled'&&r.value&&r.value.image){const d=r.value;
                li.className='plant-item loaded';li.innerHTML='<div class="plant-info"><img src="'+escapeHtml(d.image)+'" alt="'+escapeHtml(d.commonName||n)+'" class="plant-thumb" onerror="this.style.display=\\'none\\'"><div class="plant-details"><strong class="plant-common-name">'+escapeHtml(d.commonName||n)+'</strong>'+(d.scientificName?'<em class="plant-scientific-name">'+escapeHtml(d.scientificName)+'</em>':'')+'</div></div>';
                li.style.cursor='pointer';li.addEventListener('click',()=>{
                    let m=document.getElementById('plant-modal');if(!m){m=document.createElement('div');m.id='plant-modal';m.className='modal';document.body.appendChild(m)}
                    m.innerHTML='<div class="modal-content"><span class="modal-close">&times;</span>'+(d.image?'<img src="'+d.image+'" class="modal-image">':'')+'<h2>'+escapeHtml(d.commonName)+'</h2><p class="scientific-name"><em>'+escapeHtml(d.scientificName)+'</em></p>'+(d.wikipediaUrl?'<a href="'+d.wikipediaUrl+'" target="_blank" class="wiki-link">Read more on Wikipedia</a>':'')+'</div>';
                    m.style.display='flex';m.querySelector('.modal-close').addEventListener('click',()=>m.style.display='none');m.addEventListener('click',e=>{if(e.target===m)m.style.display='none'})});
            }else{li.className='plant-item';li.innerHTML='<span class="plant-name">'+escapeHtml(n)+'</span>'}});
        pl.dataset.loaded='true';
    }
    <\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

function getPreviewCSS() {
    // Inline a minimal version of the design system CSS for previews
    return `
:root{--color-cream:#F2EDE8;--color-sage-light:#E5EBE3;--color-forest:#283529;--color-terracotta:#C97D4A;--color-terracotta-hover:#B56A38;--color-text-dark:#1A2820;--color-text-body:#4A4A4A;--color-text-muted:#888;--color-text-on-dark:#FFF;--color-border:#DDD6CE;--color-skeleton:#E8E2DC;--color-surface:#EDE8E3;--font-heading:'Playfair Display',Georgia,serif;--font-body:'DM Sans',system-ui,sans-serif;--radius-sm:8px;--radius-md:16px;--radius-lg:24px;--radius-full:9999px;--shadow-card:0 2px 12px rgba(40,53,41,.08);--shadow-hover:0 8px 24px rgba(40,53,41,.12);--shadow-panel:-4px 0 24px rgba(40,53,41,.10);--shadow-sheet:0 -4px 24px rgba(40,53,41,.10);--space-2:8px;--space-3:12px;--space-4:16px;--space-5:20px;--space-6:24px;--space-8:32px;--space-10:40px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body);font-size:15px;line-height:1.6;color:var(--color-text-body);background:var(--color-cream);padding:20px}
.container{max-width:1400px;margin:0 auto;padding:32px}
h1{font-family:var(--font-heading);text-align:center;color:var(--color-text-dark);margin-bottom:var(--space-6);font-size:36px;font-weight:700}
#map{width:100%;max-width:1200px;height:600px;margin:0 auto var(--space-5);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;background:var(--color-sage-light);position:relative}
.leaflet-control-attribution{display:none!important}
.zone-nav{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:center;margin-bottom:var(--space-6);max-width:1200px;margin-left:auto;margin-right:auto}
.zone-pill{padding:var(--space-2) var(--space-4);border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-cream);color:var(--color-text-body);font-family:var(--font-body);font-size:13px;font-weight:500;cursor:pointer;transition:all 150ms;min-height:44px;display:flex;align-items:center}
.zone-pill:hover{background:var(--color-terracotta);color:#fff;border-color:var(--color-terracotta)}
.zone-pill.active{background:var(--color-forest);color:#fff;border-color:var(--color-forest)}
.popup{position:fixed;right:0;top:0;height:100vh;width:320px;background:var(--color-cream);padding:48px 16px 16px;overflow-y:auto;z-index:1000;box-shadow:var(--shadow-panel);transform:translateX(100%);transition:transform .3s ease}
.popup.show{transform:translateX(0)}
.popup h3{font-family:var(--font-heading);color:var(--color-text-dark);margin-bottom:var(--space-5);font-size:22px;font-weight:700;border-bottom:2px solid var(--color-terracotta);padding-bottom:var(--space-3)}
.popup ul{list-style:none;padding:0}
.close{position:absolute;top:12px;right:16px;font-size:28px;font-weight:bold;color:var(--color-text-muted);cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;z-index:1}
.close:hover{color:var(--color-text-body)}
.plant-item{padding:var(--space-3);margin:var(--space-2) 0;border-radius:var(--radius-md);background:#fff;box-shadow:var(--shadow-card);transition:all 200ms;min-height:44px}
.plant-item:hover{background:var(--color-surface);box-shadow:var(--shadow-hover)}
.plant-item.loaded{cursor:pointer}
.plant-info{display:flex;gap:var(--space-3);align-items:center}
.plant-thumb{width:64px;height:64px;object-fit:cover;border-radius:var(--radius-sm);flex-shrink:0}
.plant-details{flex:1;display:flex;flex-direction:column;gap:4px}
.plant-common-name{font-size:15px;font-weight:600;color:var(--color-text-dark)}
.plant-scientific-name{font-size:12px;color:var(--color-text-muted);font-style:italic}
.plant-name{font-size:15px;color:var(--color-text-dark)}
.plant-thumb-skeleton{width:64px;height:64px;border-radius:var(--radius-sm);background:var(--color-skeleton);flex-shrink:0;animation:shimmer 1.5s ease-in-out infinite}
.skeleton-text{border-radius:var(--radius-sm);background:var(--color-skeleton);animation:shimmer 1.5s ease-in-out infinite}
.skeleton-text-name{width:120px;height:15px}.skeleton-text-sci{width:90px;height:12px}
@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.5}}
.loading-message{display:none;padding:12px;text-align:center;color:var(--color-text-muted);font-style:italic}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(40,53,41,.7);z-index:10000;align-items:center;justify-content:center;padding:20px}
.modal-content{background:var(--color-cream);padding:32px;border-radius:var(--radius-lg);max-width:600px;max-height:80vh;overflow-y:auto;position:relative}
.modal-close{position:absolute;top:16px;right:20px;font-size:28px;cursor:pointer;color:var(--color-text-muted)}
.modal-image{width:100%;max-height:300px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:20px}
.modal h2{font-family:var(--font-heading);color:var(--color-text-dark);font-size:22px;margin-bottom:12px}
.scientific-name{color:var(--color-text-muted);font-size:18px;font-style:italic;margin-bottom:16px}
.wiki-link{display:inline-block;margin-top:20px;padding:12px 28px;background:var(--color-terracotta);color:#fff;text-decoration:none;border-radius:var(--radius-full);font-weight:500;transition:background 150ms}
.wiki-link:hover{background:var(--color-terracotta-hover)}
.bottom-sheet-backdrop{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.2);z-index:999}
.bottom-sheet-backdrop.show{display:block}
.instructions{margin-top:32px;padding:20px;background:var(--color-sage-light);border-radius:var(--radius-md);max-width:1200px;margin-left:auto;margin-right:auto}
.instructions p{margin:8px 0;color:var(--color-text-body)}
.instructions strong{color:var(--color-text-dark)}
@media(max-width:768px){body{padding:8px}.container{padding:16px}h1{font-size:22px}#map{height:45vh;border-radius:8px;margin-bottom:12px}.zone-pill{font-size:12px;padding:8px 12px}
.popup{right:0;left:0;bottom:0;top:auto;width:100%;height:auto;min-height:40vh;max-height:60vh;border-radius:24px 24px 0 0;transform:translateY(100%);padding:16px;padding-top:40px;box-shadow:var(--shadow-sheet)}
.popup.show{transform:translateY(0)}.popup::before{content:'';position:absolute;top:12px;left:50%;transform:translateX(-50%);width:40px;height:4px;background:var(--color-border);border-radius:9999px}}
`;
}
