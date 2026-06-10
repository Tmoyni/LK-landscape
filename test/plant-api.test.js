import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchPlantINaturalist, showPlantModal } from '../plant-api.js';

const taxonFixture = {
    id: 47602,
    preferred_common_name: 'Big Bluestem',
    name: 'Andropogon gerardii',
    default_photo: { medium_url: 'https://example.com/photo.jpg' },
    taxon_photos: [{ photo: { medium_url: 'https://example.com/photo-1.jpg' } }],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Andropogon_gerardii',
    rank: 'species',
    observations_count: 12543
};

function mockFetchResponse(body, ok = true, status = 200) {
    return vi.fn().mockResolvedValue({
        ok,
        status,
        json: () => Promise.resolve(body)
    });
}

describe('searchPlantINaturalist', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('maps a taxon result into the shape the UI renders', async () => {
        vi.stubGlobal('fetch', mockFetchResponse({ results: [taxonFixture] }));

        const plant = await searchPlantINaturalist('Big Bluestem');

        expect(plant).toEqual({
            id: 47602,
            commonName: 'Big Bluestem',
            scientificName: 'Andropogon gerardii',
            image: 'https://example.com/photo.jpg',
            photos: ['https://example.com/photo-1.jpg'],
            wikipediaUrl: 'https://en.wikipedia.org/wiki/Andropogon_gerardii',
            rank: 'species',
            observations: 12543
        });
    });

    it('URL-encodes the plant name in the request', async () => {
        const fetchMock = mockFetchResponse({ results: [taxonFixture] });
        vi.stubGlobal('fetch', fetchMock);

        await searchPlantINaturalist("Jacob's Ladder & Friends");

        const calledUrl = fetchMock.mock.calls[0][0];
        expect(calledUrl).toContain(encodeURIComponent("Jacob's Ladder & Friends"));
        expect(calledUrl).not.toContain('& Friends');
    });

    it('returns null when iNaturalist has no match', async () => {
        vi.stubGlobal('fetch', mockFetchResponse({ results: [] }));

        expect(await searchPlantINaturalist('Nonexistent Plant')).toBeNull();
    });

    it('returns null instead of throwing when the API errors', async () => {
        vi.stubGlobal('fetch', mockFetchResponse({}, false, 500));

        expect(await searchPlantINaturalist('Sedum')).toBeNull();
    });

    it('falls back to an empty image when the taxon has no default photo', async () => {
        const bare = { ...taxonFixture, default_photo: null, taxon_photos: null };
        vi.stubGlobal('fetch', mockFetchResponse({ results: [bare] }));

        const plant = await searchPlantINaturalist('Sedum');
        expect(plant.image).toBe('');
        expect(plant.photos).toEqual([]);
    });
});

describe('showPlantModal', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('renders the plant name, scientific name, and image in a visible modal', () => {
        showPlantModal({
            commonName: 'Purple Coneflower',
            scientificName: 'Echinacea purpurea',
            image: 'https://example.com/coneflower.jpg'
        });

        const modal = document.getElementById('plant-modal');
        expect(modal).not.toBeNull();
        expect(modal.style.display).toBe('flex');
        expect(modal.querySelector('h2').textContent).toBe('Purple Coneflower');
        expect(modal.querySelector('.scientific-name').textContent).toContain('Echinacea purpurea');
        expect(modal.querySelector('.modal-image').getAttribute('src')).toBe('https://example.com/coneflower.jpg');
    });

    it('hides the modal when the close button is clicked', () => {
        showPlantModal({ commonName: 'Sedum', scientificName: 'Sedum spp.' });

        const modal = document.getElementById('plant-modal');
        modal.querySelector('.modal-close').click();
        expect(modal.style.display).toBe('none');
    });

    it('reuses the same modal element across calls instead of stacking them', () => {
        showPlantModal({ commonName: 'Sedum', scientificName: 'Sedum spp.' });
        showPlantModal({ commonName: 'Aloe', scientificName: 'Aloe vera' });

        expect(document.querySelectorAll('#plant-modal').length).toBe(1);
        expect(document.querySelector('#plant-modal h2').textContent).toBe('Aloe');
    });
});
