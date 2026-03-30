# Interactive Garden Landscape Plan

## Project Overview

Interactive web app for a landscape architecture business. Clients click on regions of a garden plan image (5243 Babcock) to explore plant selections and design details for each zone.

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no framework)
- ES modules (`script.js` imports from `plant-api.js`)
- Browser-Sync for local dev server
- No build step required (static site)

## Architecture

- `index.html` — main page with popup panels for each garden zone and a canvas overlay for hover highlights
- `script.js` — zone definitions (polygon coordinates), click/hover handlers, canvas overlay rendering, responsive coordinate scaling
- `plant-api.js` — plant data fetching via iNaturalist API (free, no key required); includes search and modal display
- `styles.css` — main styles including responsive layout and popup panels
- `admin.html` / `admin.js` / `admin-styles.css` — admin interface for managing zones
- `generate-client.js` — generates client-facing HTML from admin data

## Key Concepts

- **Zone coordinates** are defined as polygon arrays in `script.js` relative to original image dimensions (1500x1034), then scaled dynamically to the displayed image size
- **Plant data** is fetched from the iNaturalist API at runtime and displayed in modals
- **Popups** are sidebar panels that slide in when a zone is clicked; each zone has its own popup div with a `data-plants` attribute listing plant names

## Development

```sh
npm run dev    # Start Browser-Sync dev server with live reload
npm run preview # Start Browser-Sync without file watching
```

## Working with Zones

When adding or modifying garden zones:
1. Define coordinates in the `zones` object in `script.js`
2. Add a corresponding popup `<div>` in `index.html` with the `data-plants` attribute
3. Add CSS for the new zone's popup class in `styles.css`

## gstack skills
/office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /land-and-deploy, /canary,
/benchmark, /browse, /qa, /qa-only, /design-review, /setup-browser-cookies,
/setup-deploy, /retro, /investigate, /document-release, /codex, /cso,
/autoplan, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade
