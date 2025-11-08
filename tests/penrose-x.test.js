import {describe, it, expect} from 'vitest';
import {
    calculatePenroseTiling,
    Vector
} from '../src/penrose-fill-polygon.js';
import {normalizeNeighborOrdering} from './neighbor-normalizer.js';

const deterministicPenrose = () =>
    calculatePenroseTiling(
        50,
        1000,
        1000,
        'square',
        'X',
        'cull',
        new Vector(500, 150),
        50
    );

describe('calculatePenroseTiling (start tile X)', () => {
    const result = deterministicPenrose();
    const rhombs = result.p3Rhombuses;

    it('returns the current number of rhombuses for the deterministic input', () => {
        expect(Object.keys(rhombs).length).toBe(105);
    });

    it('keeps thick-rhomb neighbor ordering as currently produced', () => {
        const coord = 'CXDDDDDYCX,DDDDDDDYCX';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            'CCXDDDDYCX,DYXDDDDYCX',
            'XDDDDDDYCX,YCCXDDDYCX',
            'XYCCXDDYCX,YXDDDDDYCX',
            'XXDDDDDYCX,YYXDDDDYCX'
        ]);
        expect(rhomb.base).toBe(17);
        expect(rhomb.center.x).toBeCloseTo(2.3680339887498847, 12);
        expect(rhomb.center.y).toBeCloseTo(8.826900991234579, 12);
    });

    it('includes null neighbor slots for thin rhombs exactly where they are produced today', () => {
        const coord = 'XXDDDDDYCX,YYXDDDDYCX';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            'CXDDDDDYCX,DDDDDDDYCX',
            null,
            null,
            'CCXDDDDYCX,DYXDDDDYCX'
        ]);
        expect(rhomb.base).toBe(3);
        expect(rhomb.center.x).toBeCloseTo(2.3680339887498847, 12);
        expect(rhomb.center.y).toBeCloseTo(9.777957507529727, 12);
    });

    it('matches client neighbor ordering after normalization', () => {
        const coordThick = 'CXDDDDDYCX,DDDDDDDYCX';
        const coordThin = 'XXDDDDDYCX,YYXDDDDYCX';
        const normalized = normalizeNeighborOrdering(rhombs);

        expect(normalized[coordThick].neighbors).toEqual([
            'CCXDDDDYCX,DYXDDDDYCX',
            'XDDDDDDYCX,YCCXDDDYCX',
            'XYCCXDDYCX,YXDDDDDYCX',
            'XXDDDDDYCX,YYXDDDDYCX'
        ]);
        expect(normalized[coordThick].base).toBe(17);

        expect(normalized[coordThin].neighbors).toEqual([
            null,
            null,
            'CCXDDDDYCX,DYXDDDDYCX',
            'CXDDDDDYCX,DDDDDDDYCX'
        ]);
        expect(normalized[coordThin].base).toBe(3);
    });
});
