// showPlantModal interpolates third-party API data into innerHTML — these
// tests pin the escaping added after the 2026-06-10 code review.
import { describe, it, expect, beforeEach } from 'vitest';
import { showPlantModal } from '../plant-api.js';

describe('showPlantModal escaping', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('renders hostile strings as text, not markup', () => {
        showPlantModal({
            commonName: '<img src=x onerror="window.pwned=true">',
            scientificName: '<script>window.pwned=true</script>',
            description: '<b onmouseover="x()">desc</b>'
        });

        const modal = document.getElementById('plant-modal');
        expect(modal.querySelector('h2 img')).toBeNull();
        expect(modal.querySelector('script')).toBeNull();
        expect(modal.querySelector('.description b')).toBeNull();
        expect(modal.querySelector('h2').textContent).toContain('<img src=x');
        expect(window.pwned).toBeUndefined();
    });

    it('cannot break out of attribute context via quotes in URLs', () => {
        showPlantModal({
            commonName: 'Plant "quoted" name',
            scientificName: 'Plantus testus',
            image: 'https://example.com/x.jpg" onerror="window.pwned=true',
            wikipediaUrl: 'https://example.com/" onclick="window.pwned=true'
        });

        const modal = document.getElementById('plant-modal');
        expect(modal.querySelector('.modal-image').getAttribute('onerror')).toBeNull();
        const link = modal.querySelector('.wiki-link');
        expect(link.getAttribute('onclick')).toBeNull();
        expect(link.getAttribute('rel')).toBe('noopener');
    });

    it('keeps apostrophes in designed plant names readable', () => {
        showPlantModal({ commonName: "Jacob's Ladder", scientificName: 'Polemonium reptans' });
        expect(document.querySelector('#plant-modal h2').textContent).toBe("Jacob's Ladder");
    });

    it('closes on backdrop click even after multiple opens (single listener)', () => {
        showPlantModal({ commonName: 'A', scientificName: 'a' });
        showPlantModal({ commonName: 'B', scientificName: 'b' });

        const modal = document.getElementById('plant-modal');
        expect(document.querySelectorAll('#plant-modal').length).toBe(1);
        modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(modal.style.display).toBe('none');
    });
});
