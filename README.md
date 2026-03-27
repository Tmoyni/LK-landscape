# Interactive Garden Landscape Plan

This project allows clients to click on different regions of a garden plan image to view plant information.

## Setup Instructions

1. **Add your garden plan image:**
   - Place your garden drawing/photo in this folder
   - Name it `garden-plan.jpg` (or update the filename in `index.html`)
   - Supported formats: JPG, PNG, GIF

2. **Define clickable regions:**
   - Open `index.html`
   - Find the `<map name="gardenmap">` section
   - Update the `<area>` tags with coordinates from your image

## How to Get Coordinates

### Method 1: Online Image Map Generator (Easiest)
1. Visit https://www.image-map.net/
2. Upload your garden plan image
3. Draw shapes on the regions you want to be clickable
4. Copy the generated HTML code
5. Paste the `<area>` tags into `index.html`

### Method 2: Use Browser DevTools
1. Open `index.html` in a browser
2. Right-click on the image and select "Inspect"
3. Use the console to log click coordinates:
   ```javascript
   document.getElementById('garden-image').addEventListener('click', (e) => {
       const rect = e.target.getBoundingClientRect();
       const x = e.clientX - rect.left;
       const y = e.clientY - rect.top;
       console.log(`${x},${y}`);
   });
   ```
4. Click on corners of regions to collect coordinates
5. Create `<area>` tags with these coordinates

## Area Tag Format

### Polygon (irregular shapes):
```html
<area shape="poly" coords="x1,y1,x2,y2,x3,y3,x4,y4" class="area-high" alt="Description">
```

### Circle:
```html
<area shape="circle" coords="centerX,centerY,radius" class="area-high" alt="Description">
```

### Rectangle:
```html
<area shape="rect" coords="x1,y1,x2,y2" class="area-low" alt="Description">
```

## Classes
- `area-high` - Shows "Meadow High Layer" popup (tall plants)
- `area-low` - Shows "Meadow Groundcover Layer" popup (low plants)

## Customization

### Add More Plant Zones
1. Add new popup in `index.html`:
   ```html
   <div class="popup zone-name">
       <span class="close">&times;</span>
       <h3>Zone Name</h3>
       <ul>
           <li>Plant 1</li>
           <li>Plant 2</li>
       </ul>
   </div>
   ```

2. Add CSS class in `styles.css`:
   ```css
   .zone-name {
       display: none;
   }
   ```

3. Add JavaScript in `script.js`:
   ```javascript
   const zoneName = document.querySelector('.zone-name');
   const zoneAreas = document.querySelectorAll('.area-zone-name');

   zoneAreas.forEach(area => {
       area.addEventListener('click', (e) => {
           e.preventDefault();
           popups.forEach(p => p.classList.remove('show'));
           zoneName.classList.add('show');
       });
   });
   ```

4. Add `<area>` tags with `class="area-zone-name"`

## Features

- Click regions to show plant information
- Hover over regions to see highlighted areas
- Click outside or on X to close popup
- Fully responsive design
- Works with any garden plan image

## Tips

- Use high-resolution images for best quality
- Draw regions carefully to match garden zones
- Test all clickable areas after adding coordinates
- Consider using contrasting colors in your drawing to make zones clear
