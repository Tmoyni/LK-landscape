# Testing Your Interactive Garden Plan

## ✅ What's Been Integrated

Your project now has full API integration! Here's what happens:

1. **Click on a region** of the garden plan
2. The sidebar opens with a **loading message**
3. The app fetches **real plant data** from iNaturalist API:
   - Plant photos
   - Scientific names
   - Common names
4. Each plant appears with its **thumbnail image**
5. **Click on any plant** to see a detailed modal with:
   - Large photo
   - Scientific name
   - Link to Wikipedia for more info

## 🧪 How to Test Right Now

### Step 1: Check if it's running
The server should be running at: **http://localhost:3000**

If not, start it:
```bash
python3 -m http.server 3000
```

### Step 2: Add a test image
You need an image named `garden-plan.jpg` in the project folder. You can:

**Option A:** Use any image you have:
```bash
cp /path/to/your/image.jpg garden-plan.jpg
```

**Option B:** Take a screenshot of any garden plan and save it as `garden-plan.jpg`

**Option C:** Download a sample from the web

### Step 3: Test the API integration
1. Open http://localhost:3000
2. You'll see placeholder clickable regions on the image
3. Click on the image (the clickable areas are approximate)
4. Watch the sidebar:
   - Shows "Loading plant information..."
   - Then loads each plant one by one with real photos from iNaturalist
5. Click on any plant item to see the detailed modal

## 🎯 What You Should See

### When clicking a region:
```
Meadow High Layer
Loading plant information...
```

Then after a few seconds:

```
Meadow High Layer

[Photo] Big Bluestem
       Andropogon gerardii

[Photo] New York Ironweed
       Vernonia noveboracensis

[Photo] Sweet Joe Pye
       Eutrochium purpureum
...
```

### When clicking a plant:
A modal popup appears with:
- Large plant photo
- Common name (e.g., "Big Bluestem")
- Scientific name in italics
- "Read more on Wikipedia →" link

## 🔍 Browser Console Testing

Open your browser's developer console (F12) and try:

```javascript
// Test the API directly
import('./plant-api.js').then(api => {
    api.searchPlantINaturalist('Big Bluestem').then(data => {
        console.log('Plant data:', data);
    });
});
```

You should see output like:
```javascript
{
  id: 47602,
  commonName: "Big Bluestem",
  scientificName: "Andropogon gerardii",
  image: "https://inaturalist-open-data.s3.amazonaws.com/...",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Andropogon_gerardii",
  observations: 12543
}
```

## 📱 Features to Try

1. **Click different regions** - Test both high and low layer areas
2. **Click plants** - Open the detailed modal
3. **Close modal** - Click X or outside the modal
4. **Close sidebar** - Click the X in the sidebar
5. **Hover over regions** - See purple highlight overlay
6. **Resize browser** - Check responsive design

## 🐛 Troubleshooting

### Plants not loading?
- Check browser console for errors (F12)
- Make sure you have internet connection (API requires it)
- Check if CORS is an issue (shouldn't be with iNaturalist)

### No image showing?
- Make sure `garden-plan.jpg` exists in the project folder
- Check the filename is exact (case-sensitive)
- Try refreshing the page (Cmd+R or Ctrl+R)

### Clickable regions not working?
- The example coordinates are placeholders
- You need to update them to match your actual image
- See README.md for instructions on mapping coordinates

### Module import errors?
- Make sure the server is running (not just opening the file)
- Must be served via HTTP, not `file://`
- Check that all files are in the same directory

## 🎨 Customization Ideas

Once you confirm it's working, you can:

1. **Update coordinates** to match your actual garden zones
2. **Add more plant zones** (copy/paste the popup structure)
3. **Change colors** in styles.css (search for #662D91)
4. **Add plant care info** by integrating Perenual API (see API-SETUP.md)
5. **Customize modal** to show more/less information

## 📊 API Performance

- **First load**: Takes 2-5 seconds per plant (fetching from iNaturalist)
- **Cached**: Instant on subsequent views (same session)
- **No API key needed**: iNaturalist is free and open

## 🚀 Next Steps

1. **Add your real garden image**
2. **Map the actual clickable regions** (use https://www.image-map.net/)
3. **Test with real zones** from your landscape plan
4. **Show it to your landscape architect friend**
5. **Get feedback from clients**

## 💡 Pro Tips

- Plants load one at a time, so you see progress
- Data is cached - reload the popup to see instant results
- Click plants for more details rather than Wikipedia directly
- The modal can be customized with more fields (see plant-api.js)
- You can add multiple garden plans by creating new HTML pages

---

**Everything is ready to test!** Just add an image and start clicking. 🌱

Need help? Check:
- README.md - Basic setup
- API-SETUP.md - API details
- PROJECT-PLAN.md - Future features
