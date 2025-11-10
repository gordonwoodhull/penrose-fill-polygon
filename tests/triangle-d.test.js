import { describe, it, expect } from 'vitest';
import { TriangleD, Vector } from '../src/index.ts';
import { TathamTriangleD, toLegacyTriangle } from '../src/tatham-triangle.js';
import { expectVectorClose } from './utils.js';

const GOLDEN_RATIO = 0.6180339887498948;

function makeTriangleD() {
  return new TriangleD(
    new Vector(0, 5), // apex
    new Vector(10, 0), // top of unequal edge
    new Vector(10, 10), // bottom of unequal edge
    'D'
  );
}

function makeTathamTriangleD() {
  return new TathamTriangleD(
    new Vector(0, 5),
    new Vector(10, 0),
    new Vector(10, 10),
    'D'
  );
}

const implementations = [
  [
    'legacy TriangleD',
    () => {
      const parent = makeTriangleD();
      return { parent, children: parent.split() };
    }
  ],
  [
    'TathamTriangleD via toLegacyTriangle',
    () => {
      const parentT = makeTathamTriangleD();
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
    const [childD, childX] = children;

    const vector13 = Vector.fromPoints(parent.v1, parent.v3).multiply(
      GOLDEN_RATIO
    );
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
