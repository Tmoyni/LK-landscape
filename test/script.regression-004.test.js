// Regression: ISSUE-004 — plant cards and close controls had no keyboard
// path: cards were plain <li> with click handlers, closes were <span>s, and
// Escape closed nothing.
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

    document.querySelector('.zone-pill[data-zone="zone-a"]').click();
    await new Promise(resolve => setTimeout(resolve, 20));
});

describe('keyboard access (ISSUE-004)', () => {
    it('renders close controls as real buttons', () => {
        expect(document.querySelector('.popup.zone-a .close').tagName).toBe('BUTTON');
    });

    it('makes loaded plant cards focusable buttons that open on Enter', () => {
        const li = document.querySelector('.popup.zone-a .plant-item.loaded');
        expect(li.tabIndex).toBe(0);
        expect(li.getAttribute('role')).toBe('button');

        li.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        const modal = document.getElementById('plant-modal');
        expect(modal.style.display).toBe('flex');
        expect(modal.querySelector('.modal-close').tagName).toBe('BUTTON');
    });

    it('Escape closes the modal first, then the panel', () => {
        const modal = document.getElementById('plant-modal');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(modal.style.display).toBe('none');
        expect(document.querySelector('.popup.show')).not.toBeNull();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.querySelector('.popup.show')).toBeNull();
    });
});
