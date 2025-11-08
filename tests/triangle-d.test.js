import {describe, it, expect} from 'vitest';
import {TriangleD, Vector} from '../src/penrose-fill-polygon.js';

const GOLDEN_RATIO = 0.6180339887498948;

const expectVectorClose = (actual, expected, digits = 12) => {
    expect(actual.x).toBeCloseTo(expected.x, digits);
    expect(actual.y).toBeCloseTo(expected.y, digits);
};

function makeTriangleD() {
    return new TriangleD(
        new Vector(0, 5),   // apex
        new Vector(10, 0),  // top of unequal edge
        new Vector(10, 10), // bottom of unequal edge
        'D'
    );
}

describe('TriangleD.split current vertex ordering', () => {
    it('emits child triangles with the existing v1/v2/v3 order', () => {
        const parent = makeTriangleD();
        const [childD, childX] = parent.split();

        const vector13 = Vector.fromPoints(parent.v1, parent.v3).multiply(GOLDEN_RATIO);
        const splitPoint13 = parent.v1.add(vector13);

        // First child: new TriangleD(this.v2, this.v3, split_point_13, ...)
        expect(childD.v1).toBe(parent.v2);
        expect(childD.v2).toBe(parent.v3);
        expectVectorClose(childD.v3, splitPoint13);

        // Second child: new TriangleX(split_point_13, this.v1, this.v2, ...)
        expectVectorClose(childX.v1, splitPoint13);
        expect(childX.v2).toBe(parent.v1);
        expect(childX.v3).toBe(parent.v2);
    });
});
