# TODOS

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
