// Regression: ISSUE-003 — while a panel was open on desktop, the mobile
// backdrop overlay covered the zone pills and map, swallowing every click.
// The CSS now scopes the backdrop to mobile and shifts the pill row via
// body.panel-open; this test pins the JS half of that contract.
// Found by /qa on 2026-06-10
// Report: .gstack/qa-reports/qa-report-localhost-3000-2026-06-10.md
import { describe, it, expect, vi, beforeAll } from 'vitest';

const zonesFixture = {
    projectName: 'Regression Fixture',
    imageWidth: 100,
    imageHeight: 50,
    imageSrc: 'fixture.webp',
    zones: {
        'zone-a': { coords: [0, 0, 10, 0, 10, 10], name: 'Zone A', plants: ['Sedum'] },
        'zone-b': { coords: [20, 0, 30, 0, 30, 10], name: 'Zone B', plants: ['Aloe'] }
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
            ? { results: [] }
            : zonesFixture;
        return Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
    }));

    await import('../script.js');
    await new Promise(resolve => setTimeout(resolve, 20));
});

describe('panel-open state management (ISSUE-003)', () => {
    it('marks body.panel-open while a panel is shown and clears it on close', async () => {
        document.querySelector('.zone-pill[data-zone="zone-a"]').click();
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(document.body.classList.contains('panel-open')).toBe(true);

        document.querySelector('.popup.zone-a .close').click();
        expect(document.body.classList.contains('panel-open')).toBe(false);
        expect(document.querySelector('.popup.show')).toBeNull();
    });

    it('switches directly from one zone panel to another', async () => {
        document.querySelector('.zone-pill[data-zone="zone-a"]').click();
        document.querySelector('.zone-pill[data-zone="zone-b"]').click();
        await new Promise(resolve => setTimeout(resolve, 10));

        const shown = [...document.querySelectorAll('.popup.show')];
        expect(shown.map(p => p.className)).toEqual(['popup zone-b show']);
        expect(document.body.classList.contains('panel-open')).toBe(true);
    });
});
