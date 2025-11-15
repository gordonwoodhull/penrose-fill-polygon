import { describe, it, expect } from 'vitest';
import { Vector } from '../src/index.ts';
import {
  TathamTriangleC,
  TathamTriangleX,
  TathamTriangleY
} from '../src/tatham-triangle.js';
import { expectVectorClose } from './utils.js';

const GOLDEN_RATIO = 0.6180339887498948;

function makeTathamTriangleX() {
  return new TathamTriangleX(
    new Vector(0, 0),
    new Vector(10, 10),
    new Vector(-10, 10),
    'X'
  );
}

describe('TathamTriangleX split', () => {
  it('follows the Tatham vertex ordering', () => {
    const parent = makeTathamTriangleX();
    const [childY, childC, childX] = parent.split();
    const split0 = new Vector(
      parent.v1.x + (parent.v2.x - parent.v1.x) * GOLDEN_RATIO,
      parent.v1.y + (parent.v2.y - parent.v1.y) * GOLDEN_RATIO
    );
    const split2 = new Vector(
      parent.v1.x + (parent.v3.x - parent.v1.x) * GOLDEN_RATIO,
      parent.v1.y + (parent.v3.y - parent.v1.y) * GOLDEN_RATIO
    );

    expect(childY).toBeInstanceOf(TathamTriangleY);
    expect(childC).toBeInstanceOf(TathamTriangleC);
    expect(childX).toBeInstanceOf(TathamTriangleX);

    // new TathamTriangleY(this.v1, split0, split2, ...)
    expect(childY.v1).toBe(parent.v1);
    expectVectorClose(childY.v2, split0);
    expectVectorClose(childY.v3, split2);

    // new TathamTriangleC(this.v3, split2, split0, ...)
    expect(childC.v1).toBe(parent.v3);
    expectVectorClose(childC.v2, split2);
    expectVectorClose(childC.v3, split0);

    // new TathamTriangleX(this.v2, this.v3, split0, ...)
    expect(childX.v1).toBe(parent.v2);
    expect(childX.v2).toBe(parent.v3);
    expectVectorClose(childX.v3, split0);
  });
});
