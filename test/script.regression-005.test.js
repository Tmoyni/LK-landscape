// Regression: ISSUE-005 — Leaflet kept its stale zoom/center after a
// viewport resize (e.g. phone rotation), leaving the plan cropped until
// reload. A debounced resize handler now re-fits the bounds.
// Found by /qa on 2026-06-10
// Report: .gstack/qa-reports/qa-report-localhost-3000-2026-06-10.md
import { describe, it, expect, vi, beforeAll } from 'vitest';

const zonesFixture = {
    projectName: 'Regression Fixture',
    imageWidth: 100,
    imageHeight: 50,
    imageSrc: 'fixture.webp',
    zones: {
        'zone-a': { coords: [0, 0, 10, 0, 10, 10], name: 'Zone A', plants: ['Sedum'] }
    }
};

const map = {
    fitBounds: vi.fn(),
    invalidateSize: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    panTo: vi.fn()
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
    await new Promise(resolve => setTimeout(resolve, 20));
});

describe('map re-fit on resize (ISSUE-005)', () => {
    it('re-fits the image bounds after a debounced window resize', async () => {
        const fitCallsBefore = map.fitBounds.mock.calls.length;
        expect(fitCallsBefore).toBeGreaterThan(0); // initial fit on load

        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize')); // debounce collapses these
        await new Promise(resolve => setTimeout(resolve, 250));

        expect(map.invalidateSize).toHaveBeenCalledTimes(1);
        expect(map.fitBounds.mock.calls.length).toBe(fitCallsBefore + 1);
        // Re-fit uses the same image bounds as the initial fit
        expect(map.fitBounds.mock.calls.at(-1)[0]).toEqual(map.fitBounds.mock.calls[0][0]);
    });
});
