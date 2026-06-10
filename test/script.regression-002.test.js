// Regression: ISSUE-002 — plant cards replaced the designed plant name with
// iNaturalist's first-match common name, showing wrong species and rendering
// "Sedum" + "Stonecrop" as two identical "Biting Stonecrop" cards.
// Found by /qa on 2026-06-10
// Report: .gstack/qa-reports/qa-report-localhost-3000-2026-06-10.md
import { describe, it, expect, vi, beforeAll } from 'vitest';

const zonesFixture = {
    projectName: 'Regression Fixture',
    imageWidth: 100,
    imageHeight: 50,
    imageSrc: 'fixture.webp',
    zones: {
        'succulents': {
            coords: [0, 0, 10, 0, 10, 10],
            name: 'Succulents',
            plants: ['Sedum', 'Stonecrop']
        }
    }
};

// Both designed names resolve to the same first-match taxon, like production.
const taxonFixture = {
    id: 1,
    preferred_common_name: 'Biting Stonecrop',
    name: 'Sedum acre',
    default_photo: { medium_url: 'https://example.com/sedum.jpg' },
    taxon_photos: [],
    wikipedia_url: null,
    rank: 'species',
    observations_count: 1
};

beforeAll(async () => {
    document.body.innerHTML = `
        <h1 id="page-title"></h1>
        <div id="map"></div>
        <nav id="zone-nav"></nav>
        <div id="popups-container"></div>
        <div id="backdrop" class="bottom-sheet-backdrop"></div>
    `;

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
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
        const body = String(url).includes('api.inaturalist.org')
            ? { results: [taxonFixture] }
            : zonesFixture;
        return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    }));

    await import('../script.js');
    await new Promise(resolve => setTimeout(resolve, 20));

    // Open the zone so loadPlantData runs against the mocked API
    document.querySelector('.zone-pill[data-zone="succulents"]').click();
    await new Promise(resolve => setTimeout(resolve, 20));
});

describe('plant card naming (ISSUE-002)', () => {
    it('titles cards with the designed plant names, not the API common name', () => {
        const titles = [...document.querySelectorAll('.popup.succulents .plant-common-name')]
            .map(el => el.textContent);
        expect(titles).toEqual(['Sedum', 'Stonecrop']);
    });

    it('keeps the API scientific name as the secondary line', () => {
        const sci = [...document.querySelectorAll('.popup.succulents .plant-scientific-name')]
            .map(el => el.textContent);
        expect(sci).toEqual(['Sedum acre', 'Sedum acre']);
    });

    it('opens the detail modal with the designed name as the heading', () => {
        document.querySelector('.popup.succulents .plant-item').click();
        expect(document.querySelector('#plant-modal h2').textContent).toBe('Sedum');
    });
});
