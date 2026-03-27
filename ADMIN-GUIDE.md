# 🎨 Admin Tool Guide - Create Interactive Garden Plans

## Overview

The Admin Tool lets landscape architects create interactive garden plans without writing code. Upload an image, map zones by clicking, add plant lists, and generate a client-ready webpage.

## Access the Admin Tool

Open in your browser:
```
http://localhost:3000/admin.html
```

## Quick Start (3 Steps)

### Step 1: Upload Garden Plan Image

1. Click the upload area or drag & drop your garden design image
2. Accepted formats: JPG, PNG, WebP
3. Image appears on the canvas

**Tips:**
- Use high-resolution images (1200-2000px wide)
- Make sure zones are clearly visible
- Hand-drawn plans work great!

### Step 2: Map Garden Zones

1. Click **"Start New Zone"**
2. Click points around a garden zone to outline it
3. Click **"Complete Zone"** when finished
4. Enter zone details:
   - **Zone Name**: e.g., "Wildflower Meadow"
   - **Plants**: One plant name per line
5. Click **"Save Zone"**
6. Repeat for each zone in your plan

**Tips:**
- Click accurately on zone boundaries
- You need at least 3 points to create a zone
- First point shows in red
- Each zone gets a unique color
- You can add 8-10 zones typically

**Example Plant List:**
```
Black Eyed Susan
Purple Coneflower
Butterfly Weed
Wild Bergamot
New England Aster
```

### Step 3: Generate Client View

1. Enter a **Project Name** (e.g., "5243 Babcock")
2. Click **"Preview Client View"** to test
3. Click **"Download Complete Package"** when ready

The client view will have:
- Your garden plan image
- Clickable zones
- Plant information with photos from iNaturalist API
- Professional responsive design

## Features

### Visual Zone Mapping
- **Click-based interface** - No coordinate entry needed
- **Live preview** - See zones as you draw
- **Color-coded** - Each zone has a unique color
- **Edit/Delete** - Manage zones easily

### Plant Management
- **Simple text input** - One plant per line
- **Auto-completion** - API finds plant photos automatically
- **Common names** - Use everyday plant names
- **Unlimited plants** - Add as many as you need per zone

### Client View Generation
- **One-click preview** - Test before sharing
- **Responsive design** - Works on all devices
- **Professional styling** - Purple theme, clean layout
- **Interactive popups** - Sidebar shows plant details
- **Photo integration** - Real plant photos from iNaturalist

## Workflow Example

### Creating a Plan for "123 Main Street"

1. **Upload** the landscape design PDF or image
2. **Map zones:**
   - Zone 1: "Front Entry Garden" → 5 plants
   - Zone 2: "Side Border" → 8 plants
   - Zone 3: "Rain Garden" → 6 plants
   - Zone 4: "Patio Container" → 4 plants
3. **Preview** to check everything works
4. **Download** and send to client or upload to website

**Time:** 15-20 minutes per project

## Tips for Best Results

### Image Quality
- ✅ High resolution (1200px+ width)
- ✅ Clear zone boundaries
- ✅ Good contrast
- ❌ Avoid very low resolution
- ❌ Avoid overly compressed images

### Zone Mapping
- Start with largest zones first
- Click precisely on boundaries
- Use 8-12 points for smooth shapes
- More points = smoother curves
- Less points = sharper corners

### Plant Names
- Use common names: "Black Eyed Susan" ✅
- Avoid typos: "Blak Eye Susan" ❌
- Scientific names work too: "Rudbeckia hirta" ✅
- Be consistent with capitalization
- One plant per line

### Zone Names
- Be descriptive: "Front Perennial Border" ✅
- Keep it short: "FPB" ❌
- Match your design terminology
- Use title case
- Clients will see these names

## Keyboard Shortcuts

- **Esc** - Cancel current zone
- **Delete** - Remove last point (coming soon)
- **Ctrl+Z** - Undo last point (coming soon)

## Troubleshooting

### Image won't upload
- Check file format (JPG, PNG, WebP only)
- Try a smaller file size
- Refresh the page and try again

### Zone not saving
- Make sure you added at least 3 points
- Check that zone name is filled in
- Check that at least one plant is listed

### Preview not working
- Make sure you've saved at least one zone
- Check browser console for errors (F12)
- Try refreshing and previewing again

### Plants not loading in client view
- Check plant names for typos
- Some rare plants might not be in iNaturalist
- Try using common names instead of scientific

## Advanced Tips

### Multiple Projects
- Create separate folders for each project
- Name files clearly: "ProjectName_image.jpg"
- Keep notes on zone decisions
- Save preview HTML for reference

### Client Presentations
- Present the preview during design meetings
- Let clients explore interactively
- Easy to make changes on the spot
- Professional impression

### Reusing Templates
- Create standard zone sets for common designs
- Keep a plant library document
- Reuse successful combinations
- Build your own database

## Technical Details

### What Gets Generated

The admin tool creates a standalone HTML file containing:
- Your garden plan image (embedded as base64)
- Mapped zone coordinates
- Plant lists
- All necessary CSS styling
- Interactive JavaScript
- API integration

### File Structure

```
project-name/
├── index.html          (Client view - generated)
├── garden-image.jpg    (Your uploaded image)
├── styles.css         (Included in HTML)
└── script.js          (Included in HTML)
```

### Browser Compatibility

Works in:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Future Enhancements

Coming soon:
- **Save & Load** - Save projects to edit later
- **Templates** - Pre-made zone configurations
- **Bulk Plant Import** - CSV upload
- **Edit Zones** - Modify existing zones
- **Drag Points** - Adjust zone boundaries
- **Undo/Redo** - Easier editing
- **Export Options** - PDF, image overlays
- **Plant Database** - Your custom plant library
- **Multi-Project Manager** - Track all clients

## Support

### Getting Help
- Check this guide first
- Look at the example project
- Test with the demo image
- Check browser console (F12) for errors

### Reporting Issues
- Note what you were doing
- Check browser and version
- Screenshot the issue
- Note any error messages

## Best Practices

### For Landscape Architects

1. **Standardize your process**
   - Use consistent naming
   - Create zone templates
   - Build a go-to plant list

2. **Quality over speed**
   - Take time mapping zones accurately
   - Double-check plant names
   - Preview before sharing

3. **Client communication**
   - Explain the interactive features
   - Encourage exploration
   - Gather feedback

4. **Organization**
   - Name projects clearly
   - Keep source images
   - Save preview links
   - Document changes

### For Presentations

1. **During design meetings:**
   - Present on large screen
   - Walk through each zone
   - Show plant details
   - Allow client interaction

2. **Follow-up:**
   - Email preview link
   - Include printed version
   - Note changes requested
   - Update and resend

## Examples

### Entry Garden Example
```
Zone Name: Front Entry Garden
Plants:
Little Bluestem
Purple Coneflower
Threadleaf Coreopsis
Catmint
Russian Sage
Sedum
```

### Rain Garden Example
```
Zone Name: Rain Garden Basin
Plants:
Blue Flag Iris
Swamp Milkweed
Joe Pye Weed
Cardinal Flower
Turtlehead
Marsh Marigold
```

### Shade Garden Example
```
Zone Name: Shade Border
Plants:
Hosta
Astilbe
Ferns
Solomon's Seal
Wild Ginger
Heuchera
```

---

## Quick Reference

| Action | Steps |
|--------|-------|
| Upload image | Click upload area or drag & drop |
| Start zone | Click "Start New Zone" button |
| Add point | Click on image |
| Finish zone | Click "Complete Zone" button |
| Save zone | Enter name & plants, click "Save Zone" |
| Delete zone | Click "Delete" on zone card |
| Preview | Click "Preview Client View" |
| Download | Click "Download Complete Package" |

---

**Ready to create your first interactive garden plan? Open `admin.html` and get started!** 🌱
