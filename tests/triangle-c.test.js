import {describe, it, expect} from 'vitest';
import {TriangleC, Vector} from '../penrose-fill-polygon.js';

const GOLDEN_RATIO = 0.6180339887498948;

const expectVectorClose = (actual, expected, digits = 12) => {
    expect(actual.x).toBeCloseTo(expected.x, digits);
    expect(actual.y).toBeCloseTo(expected.y, digits);
};

function makeTriangleC() {
    // Matches the orientation produced by calculatePenroseTiling for start tile C.
    return new TriangleC(
        new Vector(0, 5),   // apex
        new Vector(10, 0),  // top of unequal edge
        new Vector(10, 10), // bottom of unequal edge
        'C'
    );
}

describe('TriangleC.split current vertex ordering', () => {
    it('emits child triangles with the existing v1/v2/v3 order', () => {
        const parent = makeTriangleC();
        const [childC, childY] = parent.split();

        const vector12 = Vector.fromPoints(parent.v1, parent.v2).multiply(GOLDEN_RATIO);
        const splitPoint12 = parent.v1.add(vector12);

        // First child: new TriangleC(this.v3, split_point_12, this.v2, ...)
        expect(childC.v1).toBe(parent.v3);
        expectVectorClose(childC.v2, splitPoint12);
        expect(childC.v3).toBe(parent.v2);

        // Second child: new TriangleY(split_point_12, this.v3, this.v1, ...)
        expectVectorClose(childY.v1, splitPoint12);
        expect(childY.v2).toBe(parent.v3);
        expect(childY.v3).toBe(parent.v1);
    });
});
