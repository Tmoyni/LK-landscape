import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const data = JSON.parse(readFileSync(resolve(root, 'zones.json'), 'utf8'));

describe('zones.json data integrity', () => {
    it('has the project-level fields the client page renders', () => {
        expect(data.projectName).toBeTypeOf('string');
        expect(data.projectName.length).toBeGreaterThan(0);
        expect(data.imageWidth).toBeGreaterThan(0);
        expect(data.imageHeight).toBeGreaterThan(0);
        expect(data.imageSrc).toBeTypeOf('string');
    });

    it('points at an image file that actually exists', () => {
        expect(existsSync(resolve(root, data.imageSrc))).toBe(true);
    });

    it('defines at least one zone, each with a name and a non-empty plant list', () => {
        const zones = Object.entries(data.zones);
        expect(zones.length).toBeGreaterThan(0);
        for (const [key, zone] of zones) {
            expect(zone.name, `zone ${key} missing name`).toBeTypeOf('string');
            expect(Array.isArray(zone.plants), `zone ${key} plants not an array`).toBe(true);
            expect(zone.plants.length, `zone ${key} has no plants`).toBeGreaterThan(0);
            for (const plant of zone.plants) {
                expect(plant, `zone ${key} has a non-string plant entry`).toBeTypeOf('string');
            }
        }
    });

    it('gives every zone a valid polygon within the image bounds', () => {
        for (const [key, zone] of Object.entries(data.zones)) {
            const coords = zone.coords;
            expect(Array.isArray(coords), `zone ${key} coords not an array`).toBe(true);
            // A polygon needs at least 3 points = 6 flat values, in x,y pairs
            expect(coords.length % 2, `zone ${key} has an odd coord count`).toBe(0);
            expect(coords.length, `zone ${key} has fewer than 3 points`).toBeGreaterThanOrEqual(6);
            for (let i = 0; i < coords.length; i += 2) {
                const [x, y] = [coords[i], coords[i + 1]];
                expect(x, `zone ${key} x out of bounds at pair ${i / 2}`).toBeGreaterThanOrEqual(0);
                expect(x, `zone ${key} x out of bounds at pair ${i / 2}`).toBeLessThanOrEqual(data.imageWidth);
                expect(y, `zone ${key} y out of bounds at pair ${i / 2}`).toBeGreaterThanOrEqual(0);
                expect(y, `zone ${key} y out of bounds at pair ${i / 2}`).toBeLessThanOrEqual(data.imageHeight);
            }
        }
    });
});
