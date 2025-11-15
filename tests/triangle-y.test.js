import { describe, it, expect } from 'vitest';
import { Vector } from '../src/index.ts';
import {
  TathamTriangleD,
  TathamTriangleX,
  TathamTriangleY
} from '../src/tatham-triangle.js';
import { expectVectorClose } from './utils.js';

const GOLDEN_RATIO = 0.6180339887498948;

describe('TathamTriangleY split', () => {
  it('follows the Tatham vertex ordering', () => {
    const parent = TathamTriangleY.startTile(100, 200);
    const [childY, childD, childX] = parent.split();
    const split0 = new Vector(
      parent.v2.x + (parent.v1.x - parent.v2.x) * GOLDEN_RATIO,
      parent.v2.y + (parent.v1.y - parent.v2.y) * GOLDEN_RATIO
    );
    const split1 = new Vector(
      parent.v2.x + (parent.v3.x - parent.v2.x) * GOLDEN_RATIO,
      parent.v2.y + (parent.v3.y - parent.v2.y) * GOLDEN_RATIO
    );

    expect(childY).toBeInstanceOf(TathamTriangleY);
    expect(childD).toBeInstanceOf(TathamTriangleD);
    expect(childX).toBeInstanceOf(TathamTriangleX);

    // new TathamTriangleY(this.v3, this.v1, split0, ...)
    expect(childY.v1).toBe(parent.v3);
    expect(childY.v2).toBe(parent.v1);
    expectVectorClose(childY.v3, split0);

    // new TathamTriangleD(split1, this.v3, split0, ...)
    expectVectorClose(childD.v1, split1);
    expect(childD.v2).toBe(parent.v3);
    expectVectorClose(childD.v3, split0);

    // new TathamTriangleX(split0, this.v2, split1, ...)
    expectVectorClose(childX.v1, split0);
    expect(childX.v2).toBe(parent.v2);
    expectVectorClose(childX.v3, split1);
  });
});
