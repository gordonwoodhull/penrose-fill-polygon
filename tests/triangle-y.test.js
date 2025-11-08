import {describe, it, expect} from 'vitest';
import {TriangleY, Vector} from '../src/index.ts';

const GOLDEN_RATIO = 0.6180339887498948;

const expectVectorClose = (actual, expected, digits = 12) => {
    expect(actual.x).toBeCloseTo(expected.x, digits);
    expect(actual.y).toBeCloseTo(expected.y, digits);
};

function makeTriangleY() {
    return new TriangleY(
        new Vector(0, 0),    // apex
        new Vector(-10, 10), // left base
        new Vector(10, 10),  // right base
        'Y'
    );
}

describe('TriangleY.split current vertex ordering', () => {
    it('emits child triangles with the existing v1/v2/v3 order', () => {
        const parent = makeTriangleY();
        const [childY, childD, childX] = parent.split();

        const vector21 = Vector.fromPoints(parent.v2, parent.v1).multiply(GOLDEN_RATIO);
        const splitPoint21 = parent.v2.add(vector21);

        const vector23 = Vector.fromPoints(parent.v2, parent.v3).multiply(GOLDEN_RATIO);
        const splitPoint23 = parent.v2.add(vector23);

        // First child: new TriangleY(split_point_23, this.v3, this.v1, ...)
        expectVectorClose(childY.v1, splitPoint23);
        expect(childY.v2).toBe(parent.v3);
        expect(childY.v3).toBe(parent.v1);

        // Second child: new TriangleD(split_point_23, this.v1, split_point_21, ...)
        expectVectorClose(childD.v1, splitPoint23);
        expect(childD.v2).toBe(parent.v1);
        expectVectorClose(childD.v3, splitPoint21);

        // Third child: new TriangleX(split_point_21, this.v2, split_point_23, ...)
        expectVectorClose(childX.v1, splitPoint21);
        expect(childX.v2).toBe(parent.v2);
        expectVectorClose(childX.v3, splitPoint23);
    });
});
