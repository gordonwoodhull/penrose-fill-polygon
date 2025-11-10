import { describe, it, expect } from 'vitest';
import { TriangleX, Vector } from '../src/index.ts';
import { TathamTriangleX, toLegacyTriangle } from '../src/tatham-triangle.js';
import { expectVectorClose } from './utils.js';

const GOLDEN_RATIO = 0.6180339887498948;

function makeTriangleX() {
  return new TriangleX(
    new Vector(0, 0), // apex
    new Vector(10, 10), // right base
    new Vector(-10, 10), // left base
    'X'
  );
}

function makeTathamTriangleX() {
  return new TathamTriangleX(
    new Vector(0, 0),
    new Vector(10, 10),
    new Vector(-10, 10),
    'X'
  );
}

const implementations = [
  [
    'legacy TriangleX',
    () => {
      const parent = makeTriangleX();
      return { parent, children: parent.split() };
    }
  ],
  [
    'TathamTriangleX via toLegacyTriangle',
    () => {
      const parentT = makeTathamTriangleX();
      const childrenT = parentT.split();
      return {
        parent: toLegacyTriangle(parentT),
        children: childrenT.map(toLegacyTriangle)
      };
    }
  ]
];

describe.each(implementations)('%s', (_, setup) => {
  it('emits child triangles with the existing v1/v2/v3 order', () => {
    const { parent, children } = setup();
    const [childY, childC, childX] = children;

    const vector32 = Vector.fromPoints(parent.v3, parent.v2).multiply(
      GOLDEN_RATIO
    );
    const splitPoint32 = parent.v3.add(vector32);

    const vector31 = Vector.fromPoints(parent.v3, parent.v1).multiply(
      GOLDEN_RATIO
    );
    const splitPoint31 = parent.v3.add(vector31);

    // First child: new TriangleY(split_point_31, split_point_32, this.v3, ...)
    expectVectorClose(childY.v1, splitPoint31);
    expectVectorClose(childY.v2, splitPoint32);
    expect(childY.v3).toBe(parent.v3);

    // Second child: new TriangleC(split_point_32, split_point_31, this.v1, ...)
    expectVectorClose(childC.v1, splitPoint32);
    expectVectorClose(childC.v2, splitPoint31);
    expect(childC.v3).toBe(parent.v1);

    // Third child: new TriangleX(split_point_32, this.v1, this.v2, ...)
    expectVectorClose(childX.v1, splitPoint32);
    expect(childX.v2).toBe(parent.v1);
    expect(childX.v3).toBe(parent.v2);
  });
});
