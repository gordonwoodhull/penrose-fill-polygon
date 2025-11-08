import {describe, it, expect} from 'vitest';
import {calculatePenroseTiling, Vector} from '../src/penrose-fill-polygon.js';
import {normalizeNeighborOrdering} from './neighbor-normalizer.js';

const generate = () =>
    calculatePenroseTiling(
        60,
        1000,
        1000,
        'pentagon',
        'C',
        'cull',
        new Vector(700, 350),
        80
    );

describe('calculatePenroseTiling (start tile C)', () => {
    const result = generate();
    const rhombs = result.p3Rhombuses;

    it('yields the expected rhombus count for the deterministic setup', () => {
        expect(Object.keys(rhombs).length).toBe(101);
    });

    it('keeps the current neighbor ordering for a thick rhombus', () => {
        const coord = 'CCXYYCCCCC,DYXYYCCCCC';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            null,
            'XYXYYCCCCC,YXYXXYCCCC',
            'XXXYYCCCCC,YCXYYCCCCC',
            null
        ]);
        expect(rhomb.base).toBeNull();
        expect(rhomb.center.x).toBeCloseTo(9.773913832481954, 12);
        expect(rhomb.center.y).toBeCloseTo(4.403447892069363, 12);
    });

    it('keeps the current neighbor ordering for a thin rhombus', () => {
        const coord = 'XYXYYCCCCC,YXYXXYCCCC';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            'XXXYYCCCCC,YCXYYCCCCC',
            'CCXYYCCCCC,DYXYYCCCCC',
            'CXYXXYCCCC,DDYXXYCCCC',
            'XDYXXYCCCC,YYYXXYCCCC'
        ]);
        expect(rhomb.base).toBeNull();
        expect(rhomb.center.x).toBeCloseTo(9.04842279935036, 12);
        expect(rhomb.center.y).toBeCloseTo(4.66699793669769, 12);
    });

    it('matches client neighbor ordering after normalization', () => {
        const normalized = normalizeNeighborOrdering(rhombs);
        const thick = normalized['CCXYYCCCCC,DYXYYCCCCC'];
        const thin = normalized['XYXYYCCCCC,YXYXXYCCCC'];

        expect(thick.neighbors).toEqual([
            null,
            'XYXYYCCCCC,YXYXXYCCCC',
            'XXXYYCCCCC,YCXYYCCCCC',
            null
        ]);
        expect(thick.base).toBeNull();

        expect(thin.neighbors).toEqual([
            'XXXYYCCCCC,YCXYYCCCCC',
            'CCXYYCCCCC,DYXYYCCCCC',
            'CXYXXYCCCC,DDYXXYCCCC',
            'XDYXXYCCCC,YYYXXYCCCC'
        ]);
        expect(thin.base).toBeNull();
    });
});
