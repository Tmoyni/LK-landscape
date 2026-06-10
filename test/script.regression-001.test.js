// Regression: ISSUE-001 — plant names containing apostrophes (e.g. "Jacob's
// Ladder") truncated the data-plants attribute, so the Main Garden Bed zone
// showed "Could not load plant information." instead of its plant list.
// Found by /qa on 2026-06-10
// Report: .gstack/qa-reports/qa-report-localhost-3000-2026-06-10.md
import { describe, it, expect, vi, beforeAll } from 'vitest';

const zonesFixture = {
    projectName: 'Regression Fixture',
    imageWidth: 100,
    imageHeight: 50,
    imageSrc: 'fixture.webp',
    zones: {
        'garden-bed': {
            coords: [0, 0, 10, 0, 10, 10],
            name: 'Main Garden Bed',
            plants: ["Jacob's Ladder", 'Redbud', 'He said "grow"']
        }
    }
};

beforeAll(async () => {
    document.body.innerHTML = `
        <h1 id="page-title"></h1>
        <div id="map"></div>
        <nav id="zone-nav"></nav>
        <div id="popups-container"></div>
        <div id="backdrop" class="bottom-sheet-backdrop"></div>
    `;

    // Minimal Leaflet stub — init() only needs these calls to succeed.
    const layer = {
        addTo: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        setStyle: vi.fn(),
        getBounds: () => ({ getCenter: () => [0, 0] })
    };
    const map = { fitBounds: vi.fn(), on: vi.fn(), off: vi.fn(), panTo: vi.fn() };
    vi.stubGlobal('L', {
        map: () => map,
        imageOverlay: () => layer,
        polygon: () => layer,
        CRS: { Simple: {} }
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(zonesFixture)
    }));

    await import('../script.js');
    // init() is async fire-and-forget; let it settle
    await new Promise(resolve => setTimeout(resolve, 20));
});

describe('zone popup construction (ISSUE-001)', () => {
    it('round-trips plant names with apostrophes and quotes through data-plants', () => {
        const list = document.querySelector('.popup.garden-bed .plant-list');
        expect(list).not.toBeNull();
        const parsed = JSON.parse(list.dataset.plants);
        expect(parsed).toEqual(["Jacob's Ladder", 'Redbud', 'He said "grow"']);
    });

    it('builds a nav pill and popup for the zone', () => {
        expect(document.querySelector('.zone-pill[data-zone="garden-bed"]')).not.toBeNull();
        expect(document.querySelector('.popup.garden-bed h3').textContent).toBe('Main Garden Bed');
    });
});
