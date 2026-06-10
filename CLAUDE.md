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

## Testing

- Run tests: `npm test` (Vitest, config in `vitest.config.js`, tests in `test/`)
- See TESTING.md for layers and conventions
- Test expectations:
  - 100% test coverage is the goal — tests make vibe coding safe
  - When writing new functions, write a corresponding test
  - When fixing a bug, write a regression test
  - When adding error handling, write a test that triggers the error
  - When adding a conditional (if/else, switch), write tests for BOTH paths
  - Never commit code that makes existing tests fail

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

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
