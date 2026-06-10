# TODOS

## P2: Curated scientific names per plant (from /qa 2026-06-10, ISSUE-002 residual)
**What:** Add a scientific name per plant in zones.json (e.g. `{"name": "Irish Moss", "scientificName": "Sagina subulata"}`) and search iNaturalist by it.
**Why:** Cards now show the designed plant names (fixed), but photos still come from iNaturalist's first match on the common name — "Irish Moss" fetches a seaweed photo (Chondrus crispus), "Hens and Chicks" fetches Echeveria instead of Sempervivum. Searching by scientific name removes the ambiguity.
**Context:** Pairs naturally with the care-data work below; Logan can supply both in one pass.
**Effort:** S (human: ~2 hours / CC: ~15 min + Logan's plant list)
**Depends on:** Logan confirming intended species per zone

## P3: Admin — load/edit the existing project (from /qa 2026-06-10, ISSUE-007)
**What:** A "Load current project" button in admin.html that pulls zones.json + the plan image into the editor for modification.
**Why:** Admin always starts from a blank upload; any tweak to the live project means redrawing all five zones from scratch.
**Effort:** M (human: ~1 day / CC: ~30 min)

## P4: Admin — visible feedback on save validation (from /qa 2026-06-10, ISSUE-006)
**What:** Show an in-page message when "Save zones.json" is blocked (no zones drawn / no project name).
**Why:** Clicking Save with nothing to save currently does nothing visible.
**Effort:** S (human: ~30 min / CC: ~5 min)

## P2: Care Requirements Display
**What:** Add plant care info (watering, sun, maintenance) to each plant card.
**Why:** Clients need to know what's required for upkeep. One of the top 3 value props.
**Context:** Perenual integration code exists in plant-api.js (lines 49-134) with placeholder key. Simpler path: Logan provides a JSON object with care data per plant.
**Effort:** S (human: ~2 hours / CC: ~10 min)
**Depends on:** Logan providing plant care data OR Perenual API key (free, 300 req/day)

## Future: Multi-Project Data Layer (Approach C)
**What:** Store zone/plant data as GeoJSON files per project. Logan uploads a plan, draws zones, gets a shareable URL per client.
**Why:** Logan has multiple clients. Each needs their own garden plan.
**Context:** Natural next step after Leaflet migration. See design doc at ~/.gstack/projects/landscape/.
**Effort:** M (human: ~2 weeks / CC: ~1 hour)
**Depends on:** Leaflet migration complete

## P3: Full Design Consultation
**What:** Run /design-consultation for a complete design system when productizing.
**Why:** Current DESIGN.md is minimal (POC-level). Multi-project product needs proper brand, typography, and component library.
**Effort:** M (human: ~1 week / CC: ~30 min)
**Depends on:** Decision to productize beyond single-project POC

## Future: Client Auth + Portal
**What:** Per-client login, garden tracked over time, seasonal care reminders.
**Why:** Logan wants to "keep in touch with clients without having to do so much in person care."
**Context:** Requires backend (auth, database). Major scope increase from static site.
**Effort:** XL (human: ~2 months / CC: ~4 hours)
**Depends on:** Multi-project data layer
