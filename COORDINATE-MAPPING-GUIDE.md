# Coordinate Mapping Guide for 5243 Babcock Garden Plan

## Current Status

✅ Your garden plan image is loaded (`garden-plan.webp`)
✅ 5 plant zones are set up with sample plants
✅ API integration is working
⚠️ Clickable regions need precise coordinates

## Quick Start: Map Your Coordinates

### Option 1: Use Image Map Generator (Easiest) ⭐

1. Go to https://www.image-map.net/
2. Click "Choose File" and upload your `garden-plan.webp`
3. Use the polygon tool to trace each garden zone
4. For each area:
   - Draw the outline by clicking points around the zone
   - Double-click to close the shape
   - In the right panel, add a class name (e.g., `area-left-side`)
5. Click "Show Me The Code!"
6. Copy just the `<area>` tags
7. Replace the example areas in `index.html` (lines 66-78)

### Option 2: Get Coordinates Manually

Add this to your browser console while viewing the page:

```javascript
const img = document.getElementById('garden-image');
img.addEventListener('click', (e) => {
    const rect = img.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / rect.width * img.naturalWidth);
    const y = Math.round((e.clientY - rect.top) / rect.height * img.naturalHeight);
    console.log(`${x},${y}`);
});
```

Then click corners of each zone and collect the coordinates.

## Plant Zones to Map

Based on your landscape plan, here are the zones you need to map:

### 1. Left Side Plantings
**Current Plants:** Serviceberry, Redbud, Oak Leaf Hydrangea, Fothergilla, Wild Geranium, Pennsylvania Sedge
**Class:** `area-left-side`
**Location:** Upper left area of the plan

### 2. Front Perennial Garden
**Current Plants:** Black Eyed Susan, Purple Coneflower, Butterfly Weed, Little Bluestem, Aromatic Aster, Wild Bergamot
**Class:** `area-front-perennial`
**Location:** Lower center-left area

### 3. Rain Garden
**Current Plants:** Blue Flag Iris, Cardinal Flower, Joe Pye Weed, Swamp Milkweed, Marsh Marigold, Turtlehead
**Class:** `area-rain-garden`
**Location:** Lower left corner

### 4. Right Side Border
**Current Plants:** Switchgrass, Blazing Star, New England Aster, Goldenrod, Wild Indigo, Threadleaf Coreopsis
**Class:** `area-right-border`
**Location:** Right edge of plan

### 5. Meadow Area
**Current Plants:** Big Bluestem, Indian Grass, Prairie Dropseed, Purple Prairie Clover, Black Eyed Susan, Wild Bergamot
**Class:** `area-meadow`
**Location:** Upper center-left area

## Updating Plant Lists

To change the plants for each zone, edit `index.html`:

```html
<ul class="plant-list" data-plants='["Plant 1","Plant 2","Plant 3"]'>
```

Replace the plant names in the JSON array. The API will automatically fetch photos and info for each plant.

## Adding More Zones

To add a new zone:

1. **Add a popup in index.html:**
```html
<div class="popup new-zone">
    <span class="close">&times;</span>
    <h3>New Zone Name</h3>
    <div class="loading-message">Loading plant information...</div>
    <ul class="plant-list" data-plants='["Plant A","Plant B"]'>
    </ul>
</div>
```

2. **Add the area in the map:**
```html
<area shape="poly" coords="x1,y1,x2,y2,x3,y3" class="area-new-zone" alt="New Zone">
```

3. **Update styles.css (line 79):**
```css
.low, .high, .left-side, .front-perennial, .rain-garden, .right-border, .meadow, .new-zone {
    display: none;
}
```

4. **Update script.js (line 90-96):**
```javascript
const areaTypes = [
    'left-side',
    'front-perennial',
    'rain-garden',
    'right-border',
    'meadow',
    'new-zone'  // Add your new zone here
];
```

## Tips for Better Coordinates

1. **Use natural image size:** Your image is 600x400px (approximate)
2. **Click corners carefully:** The more points, the more accurate
3. **Test as you go:** Refresh and click to verify each region works
4. **Use polygon for irregular shapes:** Most garden beds are irregular
5. **Overlap is OK:** Areas can slightly overlap - first match wins

## Example Area Format

### Polygon (most common):
```html
<area shape="poly"
      coords="50,100,150,90,180,150,120,180,40,160"
      class="area-left-side"
      alt="Left Side Plantings">
```

### Rectangle:
```html
<area shape="rect"
      coords="50,100,200,300"
      class="area-meadow"
      alt="Meadow Area">
```

### Circle:
```html
<area shape="circle"
      coords="300,200,50"
      class="area-rain-garden"
      alt="Rain Garden">
```

## Testing Your Coordinates

1. Refresh the page (Cmd+R / Ctrl+R)
2. Hover over areas - you should see purple highlights
3. Click - the correct sidebar should open
4. If wrong sidebar opens, check your class names match
5. If nothing happens, check coordinates and reload

## Reading Your Landscape Plan

Your plan appears to have labeled zones. Look for:
- Text labels indicating plant types
- Color-coded regions
- Boundary lines between zones
- Legend/key on the sides

Match these visual zones to your clickable areas.

## Troubleshooting

### Area not clickable
- Check coordinates are within image bounds
- Verify class name matches between `<area>` and JavaScript
- Make sure coordinates are comma-separated numbers only

### Wrong popup opens
- Class names must match exactly: `area-left-side` → popup class `left-side`
- Check for typos in class names

### Highlights not showing
- Coordinates might be outside the visible image
- Check browser console for errors (F12)

### API not loading plants
- Check internet connection
- Look for errors in browser console
- Plant names might not be found in iNaturalist database

## Next Steps

1. Map all 5 zones with accurate coordinates
2. Update plant lists with actual plants from the landscape plan
3. Test each zone thoroughly
4. Add more zones if needed
5. Share with your landscape architect friend!

---

Need help? Check the browser console (F12) for error messages.
