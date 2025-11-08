import {describe, it, expect} from 'vitest';
import {calculatePenroseTiling, Vector} from '../penrose-fill-polygon.js';

const generate = () =>
    calculatePenroseTiling(
        80,
        1200,
        900,
        'hexagon',
        'D',
        'cull',
        new Vector(850, 300),
        90
    );

describe('calculatePenroseTiling (start tile D)', () => {
    const result = generate();
    const rhombs = result.p3Rhombuses;

    it('yields the expected rhombus count for the deterministic setup', () => {
        expect(Object.keys(rhombs).length).toBe(98);
    });

    it('keeps the current neighbor ordering for a thick rhombus (and matches full geometry)', () => {
        const coord = 'XDYYXYYYXD,YYYYXYYYXD';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            'XXDYXYYYXD,YYXYXYYYXD',
            null,
            null,
            'CXYYXYYYXD,DDYYXYYYXD'
        ]);
        expect(rhomb.base).toBeNull();
        expect(rhomb.center.x).toBeCloseTo(9.783298867808924, 12);
        expect(rhomb.center.y).toBeCloseTo(3.880069920860051, 12);

        const {v1, v2, v3, v4, fillColor} = rhomb.rhombus;
        expect(fillColor).toBe('red');
        expect(v1.x).toBeCloseTo(9.954728519700355, 12);
        expect(v1.y).toBeCloseTo(4.469951604600138, 12);
        expect(v2.x).toBeCloseTo(9.057111209037688, 12);
        expect(v2.y).toBeCloseTo(4.143873029565025, 12);
        expect(v3.x).toBeCloseTo(9.611869215917494, 12);
        expect(v3.y).toBeCloseTo(3.2901882371199638, 12);
        expect(v4.x).toBeCloseTo(10.509486526580162, 12);
        expect(v4.y).toBeCloseTo(3.616266812155077, 12);
    });

    it('keeps the current neighbor ordering for a thin rhombus', () => {
        const coord = 'XXDYXYYYXD,YYXYXYYYXD';
        const rhomb = rhombs[coord];
        expect(rhomb).toBeDefined();
        expect(rhomb.neighbors).toEqual([
            'CXDYXYYYXD,DDDYXYYYXD',
            'XDYYXYYYXD,YYYYXYYYXD',
            'XXYXYXDYXD,YYCXYXDYXD',
            'CCXYXYYYXD,DYXYXYYYXD'
        ]);
        expect(rhomb.base).toBeNull();
        expect(rhomb.center.x).toBeCloseTo(9.505919864369021, 12);
        expect(rhomb.center.y).toBeCloseTo(4.834518534492529, 12);
    });
});
