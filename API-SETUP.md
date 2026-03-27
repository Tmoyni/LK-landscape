# Plant API Setup Guide

This guide explains how to integrate plant APIs to automatically fetch plant information, photos, and care instructions.

## Recommended APIs

### 1. iNaturalist API ⭐ **Easiest - No API Key Required**

**Best for:** Photos of plants, basic info, Wikipedia links

**Pros:**
- Free, no registration needed
- Good plant photos from real observations
- Links to Wikipedia articles
- Large database

**Cons:**
- Less structured care information
- Photos may vary in quality

**Setup:** Already configured in `plant-api.js` - works out of the box!

---

### 2. Perenual API (Recommended for detailed care info)

**Best for:** Detailed care guides, hardiness zones, comprehensive plant data

**Pros:**
- 10,000+ species
- Excellent care guides
- Watering, sunlight, maintenance info
- Hardiness zones
- Free tier: 300 requests/day

**Cons:**
- Requires API key (free)
- May not have all native species

**Setup:**
1. Go to https://perenual.com/docs/api
2. Sign up for a free account
3. Copy your API key
4. Add it to `plant-api.js`:
   ```javascript
   const API_CONFIG = {
       perenual: {
           key: 'YOUR_API_KEY_HERE',
           baseUrl: 'https://perenual.com/api'
       }
   };
   ```

---

### 3. Trefle API

**Best for:** Scientific data, extensive plant database

**Pros:**
- 400,000+ plant species
- Very comprehensive data
- Scientific accuracy

**Cons:**
- Requires API key
- Only 120 requests/day on free tier
- More complex to use

**Setup:**
1. Go to https://trefle.io
2. Sign up for a free account
3. Get your API token
4. Add to `plant-api.js`

---

## Quick Start (Using iNaturalist - No API Key)

The easiest way to get started is with iNaturalist, which is already configured and requires no API key.

### Update your HTML to use the API:

Replace the current `index.html` script tag with:

```html
<script type="module">
    import { createEnhancedPlantItem } from './plant-api.js';

    const popups = document.querySelectorAll(".popup");
    const high = document.querySelector(".high");
    const low = document.querySelector(".low");

    // Enhanced: Load plant data when popup opens
    async function loadPlantData(popup) {
        const plantList = popup.querySelector('.plant-list');
        if (!plantList || plantList.dataset.loaded === 'true') return;

        const plantNames = Array.from(popup.querySelectorAll('p'))
            .map(p => p.textContent.trim());

        // Clear existing items
        plantList.innerHTML = '';

        // Create enhanced items with API data
        for (const name of plantNames) {
            const item = await createEnhancedPlantItem(name);
            plantList.appendChild(item);
        }

        plantList.dataset.loaded = 'true';
    }

    // Rest of your existing code...
</script>
```

### Update your CSS:

Add these styles to `styles.css`:

```css
/* Plant item styles */
.plant-item {
    padding: 12px;
    margin: 8px 0;
    border-radius: 8px;
    background: #f5f5f5;
    transition: all 0.2s;
}

.plant-item:hover {
    background: #e8e8e8;
    transform: translateX(4px);
}

.plant-item.loading {
    opacity: 0.6;
}

.plant-info {
    display: flex;
    gap: 12px;
    align-items: center;
}

.plant-thumb {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
}

.plant-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.plant-common-name {
    font-size: 16px;
    color: #333;
}

.plant-scientific-name {
    font-size: 13px;
    color: #666;
}

.plant-link {
    font-size: 12px;
    color: #662D91;
    text-decoration: none;
}

.plant-link:hover {
    text-decoration: underline;
}

/* Modal styles */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 28px;
    cursor: pointer;
    color: #999;
}

.modal-close:hover {
    color: #333;
}

.modal-image {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 20px;
}

.plant-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin: 20px 0;
}

.stat {
    padding: 10px;
    background: #f5f5f5;
    border-radius: 6px;
}
```

---

## Usage Examples

### Example 1: Load plants on popup open

```javascript
highAreas.forEach(area => {
    area.addEventListener('click', async (e) => {
        e.preventDefault();
        popups.forEach(p => p.classList.remove('show'));
        high.classList.add('show');

        // Load plant data
        await loadPlantData(high);
    });
});
```

### Example 2: Search for a specific plant

```javascript
import { searchPlantINaturalist } from './plant-api.js';

const plantData = await searchPlantINaturalist('Big Bluestem');
console.log(plantData);
// {
//   commonName: "Big Bluestem",
//   scientificName: "Andropogon gerardii",
//   image: "https://...",
//   wikipediaUrl: "https://..."
// }
```

### Example 3: Batch load multiple plants

```javascript
import { fetchMultiplePlants } from './plant-api.js';

const plants = [
    'Big Bluestem',
    'New York Ironweed',
    'Sweet Joe Pye'
];

const plantData = await fetchMultiplePlants(plants);
// Returns array of plant data
```

---

## Testing the API

1. Open your browser console
2. Type:
   ```javascript
   import('./plant-api.js').then(api => {
       api.searchPlantINaturalist('Big Bluestem').then(data => {
           console.log(data);
       });
   });
   ```
3. You should see plant data returned

---

## Caching & Performance

The API module includes automatic caching:
- Results are cached in memory during the session
- Prevents duplicate API calls for the same plant
- Improves performance and reduces API usage

---

## Rate Limits

### iNaturalist
- No official rate limit
- Be respectful, don't spam requests

### Perenual (Free Tier)
- 300 requests per day
- Resets daily

### Trefle (Free Tier)
- 120 requests per day
- Resets daily

**Tip:** Use caching and only load data when users click on plants!

---

## Fallback Strategy

If an API call fails, the code falls back to displaying just the plant name. This ensures your site always works even if:
- API is down
- Rate limit is exceeded
- Network issues occur

---

## Next Steps

1. Choose which API to use (iNaturalist is easiest to start)
2. Update your HTML to use the enhanced plant items
3. Add the CSS styles for better presentation
4. Test with your plant list
5. Optionally add more APIs for additional data

## Production Considerations

For a production site, consider:

1. **Backend proxy:** Don't expose API keys in client-side code
2. **Database:** Cache plant data in a database to reduce API calls
3. **Image hosting:** Download and host plant images yourself
4. **Error handling:** More robust error messages for users
5. **Loading states:** Better visual feedback during API calls

---

Let me know if you need help implementing any of these!
