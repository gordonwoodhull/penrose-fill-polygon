import { describe, it, expect } from 'vitest';
import { Vector } from '../src/index.ts';
import { TathamTriangleD, TathamTriangleX } from '../src/tatham-triangle.js';
import { expectVectorClose } from './utils.js';

const GOLDEN_RATIO = 0.6180339887498948;

function makeTathamTriangleD() {
  return new TathamTriangleD(
    new Vector(0, 5),
    new Vector(10, 0),
    new Vector(10, 10),
    'D'
  );
}

describe('TathamTriangleD split', () => {
  it('follows the Tatham vertex ordering', () => {
    const parent = TathamTriangleD.startTile(100, 200);
    const [childD, childX] = parent.split();
    const splitPoint = new Vector(
      parent.v3.x + (parent.v1.x - parent.v3.x) * GOLDEN_RATIO,
      parent.v3.y + (parent.v1.y - parent.v3.y) * GOLDEN_RATIO
    );

    expect(childD).toBeInstanceOf(TathamTriangleD);
    expect(childX).toBeInstanceOf(TathamTriangleX);

    // new TathamTriangleD(split_point, this.v1, this.v2, ...)
    expectVectorClose(childD.v1, splitPoint);
    expect(childD.v2).toBe(parent.v1);
    expect(childD.v3).toBe(parent.v2);

    // new TathamTriangleX(this.v2, this.v3, split_point, ...)
    expect(childX.v1).toBe(parent.v2);
    expect(childX.v2).toBe(parent.v3);
    expectVectorClose(childX.v3, splitPoint);
  });
});
