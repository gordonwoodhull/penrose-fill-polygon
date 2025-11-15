import { describe, it, expect } from 'vitest';
import { Vector } from '../src/index.ts';
import { TathamTriangleC, TathamTriangleY } from '../src/tatham-triangle.js';
import { expectVectorClose } from './utils.js';

const GOLDEN_RATIO = 0.6180339887498948;

describe('TathamTriangleC split', () => {
  it('preserves the Tatham vertex ordering', () => {
    const parent = TathamTriangleC.startTile(100, 200);
    const [childC, childY] = parent.split();
    const splitPoint = new Vector(
      parent.v3.x + (parent.v2.x - parent.v3.x) * GOLDEN_RATIO,
      parent.v3.y + (parent.v2.y - parent.v3.y) * GOLDEN_RATIO
    );

    expect(childC).toBeInstanceOf(TathamTriangleC);
    expect(childY).toBeInstanceOf(TathamTriangleY);

    // new TathamTriangleC(this.v2, split_point, this.v1, ...)
    expect(childC.v1).toBe(parent.v2);
    expectVectorClose(childC.v2, splitPoint);
    expect(childC.v3).toBe(parent.v1);

    // new TathamTriangleY(this.v3, this.v1, split_point, ...)
    expect(childY.v1).toBe(parent.v3);
    expect(childY.v2).toBe(parent.v1);
    expectVectorClose(childY.v3, splitPoint);
  });
});
