import {describe, it, expect} from 'vitest';
import {calculatePenroseTiling, Vector} from '../penrose-fill-polygon.js';
import {normalizeNeighborOrdering} from './neighbor-normalizer.js';

const generate = () =>
    calculatePenroseTiling(
        70,
        900,
        900,
        'square',
        'Y',
        'cull',
        new Vector(400, 160),
        60
    );

describe('calculatePenroseTiling (start tile Y)', () => {
    const result = generate();
    const rhombs = result.p3Rhombuses;

    it('yields the expected rhombus count for the deterministic setup', () => {
        expect(Object.keys(rhombs).length).toBe(86);
    });

    it('keeps the current neighbor ordering for a thick rhombus', () => {
        const coord = 'XDDYYYYYY,YCCXXDYYY';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            null,
            null,
            'CCCXXDYYY,DYCXXDYYY',
            'XYCXXDYYY,YXXXXDYYY'
        ]);
        expect(rhomb.base).toBe(4);
        expect(rhomb.center.x).toBeCloseTo(0.654508497187476, 12);
        expect(rhomb.center.y).toBeCloseTo(6.043110080205621, 12);
    });

    it('keeps the current neighbor ordering for a thin rhombus', () => {
        const coord = 'XYXYYYYYY,YXYXDYYYY';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            'XXXYYYYYY,YCXYYYYYY',
            null,
            null,
            'XDYXDYYYY,YYYXDYYYY'
        ]);
        expect(rhomb.base).toBe(2);
        expect(rhomb.center.x).toBeCloseTo(1.0000000000000062, 12);
        expect(rhomb.center.y).toBeCloseTo(8.057480106940828, 12);
    });

    it('matches client neighbor ordering after normalization', () => {
        const normalized = normalizeNeighborOrdering(rhombs);
        const thick = normalized['XDDYYYYYY,YCCXXDYYY'];
        const thin = normalized['XYXYYYYYY,YXYXDYYYY'];

        expect(thick.neighbors).toEqual([
            null,
            'CCCXXDYYY,DYCXXDYYY',
            'XYCXXDYYY,YXXXXDYYY',
            null
        ]);
        expect(thick.base).toBe(4);

        expect(thin.neighbors).toEqual([
            null,
            null,
            'XDYXDYYYY,YYYXDYYYY',
            'XXXYYYYYY,YCXYYYYYY'
        ]);
        expect(thin.base).toBe(2);
    });
});
