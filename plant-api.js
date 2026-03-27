// Plant API Integration Module

/**
 * Available Plant APIs:
 *
 * 1. Trefle API (https://trefle.io)
 *    - 400,000+ plant species
 *    - Images, scientific data, growth info
 *    - Free tier: 120 requests/day
 *    - Requires API key
 *
 * 2. Perenual API (https://perenual.com/docs/api)
 *    - 10,000+ plant species
 *    - Care guides, images, hardiness zones
 *    - Free tier: 300 requests/day
 *    - Requires API key
 *
 * 3. USDA Plants Database (https://plants.usda.gov)
 *    - Focus on North American native plants
 *    - Free, no API key required
 *    - Good for native plant info
 *
 * 4. iNaturalist API (https://www.inaturalist.org/pages/api+reference)
 *    - Crowdsourced observations
 *    - Photos from real locations
 *    - Free, no API key required
 */

// Configuration - Add your API keys here
const API_CONFIG = {
    perenual: {
        key: 'YOUR_PERENUAL_API_KEY', // Get from https://perenual.com/docs/api
        baseUrl: 'https://perenual.com/api'
    },
    trefle: {
        key: 'YOUR_TREFLE_API_KEY', // Get from https://trefle.io
        baseUrl: 'https://trefle.io/api/v1'
    }
};

// Cache to avoid repeated API calls
const plantCache = new Map();

/**
 * Search for a plant by name using Perenual API
 * @param {string} plantName - Common or scientific name
 * @returns {Promise<Object>} Plant data
 */
async function searchPlantPerenual(plantName) {
    // Check cache first
    if (plantCache.has(plantName)) {
        return plantCache.get(plantName);
    }

    try {
        const url = `${API_CONFIG.perenual.baseUrl}/species-list?key=${API_CONFIG.perenual.key}&q=${encodeURIComponent(plantName)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const plant = data.data[0];
            const plantInfo = {
                id: plant.id,
                commonName: plant.common_name,
                scientificName: plant.scientific_name?.[0] || '',
                image: plant.default_image?.regular_url || plant.default_image?.thumbnail || '',
                cycle: plant.cycle,
                watering: plant.watering,
                sunlight: plant.sunlight
            };

            // Cache the result
            plantCache.set(plantName, plantInfo);
            return plantInfo;
        }

        return null;
    } catch (error) {
        console.error('Error fetching plant data:', error);
        return null;
    }
}

/**
 * Get detailed plant information by ID from Perenual API
 * @param {number} plantId - Plant ID from search
 * @returns {Promise<Object>} Detailed plant data
 */
async function getPlantDetailsPerenual(plantId) {
    try {
        const url = `${API_CONFIG.perenual.baseUrl}/species/details/${plantId}?key=${API_CONFIG.perenual.key}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const plant = await response.json();

        return {
            id: plant.id,
            commonName: plant.common_name,
            scientificName: plant.scientific_name,
            family: plant.family,
            images: plant.default_image,
            description: plant.description,
            dimensions: {
                height: plant.dimension?.height_max || 'Unknown',
                spread: plant.dimension?.spread_max || 'Unknown'
            },
            care: {
                watering: plant.watering,
                sunlight: plant.sunlight,
                hardiness: plant.hardiness,
                maintenance: plant.maintenance
            },
            growth: {
                growthRate: plant.growth_rate,
                flowerColor: plant.flower_color,
                bloomTime: plant.flowering_season
            },
            edible: plant.edible_fruit || false,
            poisonous: plant.poisonous_to_humans || plant.poisonous_to_pets || false
        };
    } catch (error) {
        console.error('Error fetching plant details:', error);
        return null;
    }
}

/**
 * Search for a plant using iNaturalist API (free, no key required)
 * @param {string} plantName - Common or scientific name
 * @returns {Promise<Object>} Plant data with photos
 */
async function searchPlantINaturalist(plantName) {
    try {
        // Search for taxa (species)
        const searchUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(plantName)}&rank=species`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const taxon = data.results[0];

            return {
                id: taxon.id,
                commonName: taxon.preferred_common_name,
                scientificName: taxon.name,
                image: taxon.default_photo?.medium_url || '',
                photos: taxon.taxon_photos?.map(p => p.photo.medium_url) || [],
                wikipediaUrl: taxon.wikipedia_url,
                rank: taxon.rank,
                observations: taxon.observations_count
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching iNaturalist data:', error);
        return null;
    }
}

/**
 * Get plant care guide from Perenual API
 * @param {number} plantId - Plant ID
 * @returns {Promise<Object>} Care guide data
 */
async function getPlantCareGuide(plantId) {
    try {
        const url = `${API_CONFIG.perenual.baseUrl}/species-care-guide-list?species_id=${plantId}&key=${API_CONFIG.perenual.key}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching care guide:', error);
        return [];
    }
}

/**
 * Batch fetch multiple plants
 * @param {Array<string>} plantNames - Array of plant names
 * @returns {Promise<Array>} Array of plant data
 */
async function fetchMultiplePlants(plantNames) {
    const promises = plantNames.map(name => searchPlantINaturalist(name));
    return await Promise.all(promises);
}

/**
 * Create enhanced plant list item with API data
 * @param {string} plantName - Plant name to search
 * @returns {Promise<HTMLElement>} List item with plant data
 */
async function createEnhancedPlantItem(plantName) {
    const li = document.createElement('li');
    li.className = 'plant-item loading';
    li.innerHTML = `
        <span class="plant-name">${plantName}</span>
        <span class="loading-spinner">Loading...</span>
    `;

    // Fetch plant data
    const plantData = await searchPlantINaturalist(plantName);

    if (plantData) {
        li.className = 'plant-item loaded';
        li.innerHTML = `
            <div class="plant-info">
                ${plantData.image ? `<img src="${plantData.image}" alt="${plantName}" class="plant-thumb">` : ''}
                <div class="plant-details">
                    <strong class="plant-common-name">${plantData.commonName || plantName}</strong>
                    <em class="plant-scientific-name">${plantData.scientificName || ''}</em>
                    ${plantData.wikipediaUrl ? `<a href="${plantData.wikipediaUrl}" target="_blank" class="plant-link">Learn more →</a>` : ''}
                </div>
            </div>
        `;

        // Make it clickable to show more details
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => showPlantModal(plantData));
    } else {
        li.className = 'plant-item';
        li.innerHTML = `<span class="plant-name">${plantName}</span>`;
    }

    return li;
}

/**
 * Show detailed plant modal
 * @param {Object} plantData - Plant data to display
 */
function showPlantModal(plantData) {
    // Create or get existing modal
    let modal = document.getElementById('plant-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'plant-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="modal-body">
                ${plantData.image ? `<img src="${plantData.image}" alt="${plantData.commonName}" class="modal-image">` : ''}
                <h2>${plantData.commonName}</h2>
                <p class="scientific-name"><em>${plantData.scientificName}</em></p>

                ${plantData.description ? `<p class="description">${plantData.description}</p>` : ''}

                <div class="plant-stats">
                    ${plantData.dimensions ? `
                        <div class="stat">
                            <strong>Height:</strong> ${plantData.dimensions.height}
                        </div>
                        <div class="stat">
                            <strong>Spread:</strong> ${plantData.dimensions.spread}
                        </div>
                    ` : ''}

                    ${plantData.care ? `
                        <div class="stat">
                            <strong>Watering:</strong> ${plantData.care.watering}
                        </div>
                        <div class="stat">
                            <strong>Sunlight:</strong> ${Array.isArray(plantData.care.sunlight) ? plantData.care.sunlight.join(', ') : plantData.care.sunlight}
                        </div>
                    ` : ''}
                </div>

                ${plantData.wikipediaUrl ? `
                    <a href="${plantData.wikipediaUrl}" target="_blank" class="wiki-link">Read more on Wikipedia →</a>
                ` : ''}
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Export functions for use in other files
export {
    searchPlantPerenual,
    getPlantDetailsPerenual,
    searchPlantINaturalist,
    getPlantCareGuide,
    fetchMultiplePlants,
    createEnhancedPlantItem,
    showPlantModal
};
