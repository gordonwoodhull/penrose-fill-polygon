import { range, min, max, extent, mean } from 'd3-array';
import { randomUniform } from 'd3-random';
import {
  GOLDEN_RATIO,
  Vector,
  Triangle,
  TriangleC,
  TriangleD,
  TriangleX,
  TriangleY,
  Rhombus,
  trianglesIntersect,
  triangleListsIntersect,
  average_vectors,
  interpolate_vectors,
  calculateTrianglesBB,
  calculateRhombusesBB,
  type Point,
  type TriangleLike
} from './geometry';
import {
  TathamTriangleC,
  TathamTriangleD,
  TathamTriangleX,
  TathamTriangleY,
  toLegacyTriangle
} from './tatham-triangle';
import {
  base_to_key,
  rhomb_key,
  key_to_base,
  truncate_float,
  unitVectors,
  type RhombusVectors
} from './base-rhombuses';

type TriangleKind = 'C' | 'D' | 'X' | 'Y';
type BoundsShape = 'square' | 'pentagon' | 'hexagon';
type ResolveRaggedMode = 'none' | 'cull' | 'fill';
type TathamTriangleType =
  | TathamTriangleC
  | TathamTriangleD
  | TathamTriangleX
  | TathamTriangleY;

interface ShapeSpecEntry {
  sides: number;
  offset: number;
}

interface RhombHashEntry {
  rhombus: Rhombus;
  tri1: Triangle;
  tri2: Triangle;
  neighbors: Array<string | null>;
  tri1scale?: Triangle;
  tri2scale?: Triangle;
  center?: Vector;
  key?: string;
  base: number | null;
}

export interface PenroseTilingResult {
  center: Vector;
  r: number;
  polygon: Vector[];
  robinsonTriangles: Triangle[];
  discardedTriangles: Triangle[];
  culledTriangles: Triangle[];
  p3Rhombuses: Record<string, RhombHashEntry>;
  culledRhombuses: Rhombus[];
  fillsIdentified: string[];
  fillsFound: Triangle[];
  rhombBases: number[];
  scaleFunction: (vector: Vector) => Vector;
}

export {
  GOLDEN_RATIO,
  Vector,
  Triangle,
  TriangleC,
  TriangleD,
  TriangleX,
  TriangleY,
  Rhombus,
  trianglesIntersect,
  triangleListsIntersect,
  average_vectors,
  interpolate_vectors,
  calculateTrianglesBB,
  calculateRhombusesBB
} from './geometry';

export {
  calculateBaseRhombuses,
  rhomb_key,
  truncate_float
} from './base-rhombuses';

type ExternalNeighbor = { external: true; side: 0 | 1 | 2; hand?: 'l' | 'r' };
type InternalNeighbor = { prefix: TriangleKind; enter: 0 | 1 | 2 };
type Neighbor = ExternalNeighbor | InternalNeighbor;

const rtri_neighbors: Record<string, Record<0 | 1 | 2, Neighbor>> = {
  CC: {
    0: { external: true, side: 1, hand: 'r' },
    1: { prefix: 'Y', enter: 1 },
    2: { external: true, side: 0 }
  },
  YC: {
    0: { external: true, side: 2 },
    1: { prefix: 'C', enter: 1 },
    2: { external: true, side: 1, hand: 'l' }
  },
  XD: {
    0: { external: true, side: 1 },
    1: { external: true, side: 2, hand: 'r' },
    2: { prefix: 'D', enter: 2 }
  },
  DD: {
    0: { external: true, side: 2, hand: 'l' },
    1: { external: true, side: 0 },
    2: { prefix: 'X', enter: 2 }
  },
  YX: {
    0: { external: true, side: 0, hand: 'r' },
    1: { prefix: 'C', enter: 1 },
    2: { external: true, side: 2, hand: 'l' }
  },
  CX: {
    0: { external: true, side: 2, hand: 'r' },
    1: { prefix: 'Y', enter: 1 },
    2: { prefix: 'X', enter: 1 }
  },
  XX: {
    0: { external: true, side: 1 },
    1: { prefix: 'C', enter: 2 },
    2: { external: true, side: 0, hand: 'l' }
  },
  YY: {
    0: { external: true, side: 2 },
    1: { external: true, side: 0, hand: 'r' },
    2: { prefix: 'D', enter: 1 }
  },
  DY: {
    0: { external: true, side: 1, hand: 'l' },
    1: { prefix: 'Y', enter: 2 },
    2: { prefix: 'X', enter: 2 }
  },
  XY: {
    0: { external: true, side: 0, hand: 'l' },
    1: { external: true, side: 1, hand: 'r' },
    2: { prefix: 'D', enter: 2 }
  }
} as const;

const other_hand: Record<'l' | 'r', 'l' | 'r'> = {
  l: 'r',
  r: 'l'
} as const;

type WholeSide = { w: { part: TriangleKind; side: 0 | 1 | 2 } };
type SplitSide = {
  l: { part: TriangleKind; side: 0 | 1 | 2 };
  r: { part: TriangleKind; side: 0 | 1 | 2 };
};
type EntryDirection = WholeSide | SplitSide;

const rtri_entries: Record<TriangleKind, Record<0 | 1 | 2, EntryDirection>> = {
  C: {
    0: { w: { part: 'C', side: 2 } },
    1: { l: { part: 'Y', side: 2 }, r: { part: 'C', side: 0 } },
    2: { w: { part: 'Y', side: 0 } }
  },
  D: {
    0: { w: { part: 'D', side: 1 } },
    1: { w: { part: 'X', side: 0 } },
    2: { l: { part: 'D', side: 0 }, r: { part: 'X', side: 1 } }
  },
  X: {
    0: { l: { part: 'X', side: 2 }, r: { part: 'Y', side: 0 } },
    1: { w: { part: 'X', side: 0 } },
    2: { l: { part: 'Y', side: 2 }, r: { part: 'C', side: 0 } }
  },
  Y: {
    0: { l: { part: 'X', side: 0 }, r: { part: 'Y', side: 1 } },
    1: { l: { part: 'D', side: 0 }, r: { part: 'X', side: 1 } },
    2: { w: { part: 'Y', side: 0 } }
  }
};

type NeighborKey = keyof typeof rtri_neighbors;
type EntryKey = keyof typeof rtri_entries;

export function tatham_neighbor(
  coord: string,
  side: 0 | 1 | 2
): [string, 0 | 1 | 2] {
  if (coord.length < 2) throw new Error('no neighbor');
  const pre2 = coord.slice(0, 2);
  const neighbors = rtri_neighbors[pre2 as NeighborKey];
  if (!neighbors) throw new Error(`unknown prefix ${pre2}`);
  const nei = neighbors[side];
  if ('external' in nei) {
    const [parent, pside] = tatham_neighbor(coord.slice(1), nei.side);
    const prefix = parent[0] as EntryKey;
    const enter = rtri_entries[prefix][pside];
    let part: TriangleKind;
    let nextSide: 0 | 1 | 2;
    if (nei.hand) {
      if ('l' in enter) {
        ({ part, side: nextSide } = enter[other_hand[nei.hand]]);
      } else throw new Error('expected handed entry');
    } else {
      if ('w' in enter) {
        ({ part, side: nextSide } = enter.w);
      } else throw new Error('expected wedge entry');
    }
    return [part + parent, nextSide];
  } else {
    return [nei.prefix + coord.slice(1), nei.enter];
  }
}

export function tatham_neighbor_or_null(
  coord: string,
  side: 0 | 1 | 2
): string | null {
  try {
    return tatham_neighbor(coord, side)[0];
  } catch (xep) {
    console.warn('no neighbor', side, 'for', coord);
    return null;
  }
}

const shape_spec: Record<BoundsShape, ShapeSpecEntry> = {
  square: {
    sides: 4,
    offset: 0.5
  },
  pentagon: {
    sides: 5,
    offset: -0.25
  },
  hexagon: {
    sides: 6,
    offset: 0
  }
};

function regularPolygon(
  center: Vector,
  r: number,
  shape: BoundsShape
): Vector[] {
  const { sides, offset } = shape_spec[shape];
  const thetas = range(offset ?? 0, sides, 1).map(
    (v) => (v * 2 * Math.PI) / sides
  );
  return thetas.map(
    (theta) =>
      new Vector(Math.cos(theta) * r + center.x, Math.sin(theta) * r + center.y)
  );
}

function triangulate(polygon: Vector[]): Triangle[] {
  return range(2, polygon.length).map(
    (i) => new Triangle(polygon[0], polygon[i - 1], polygon[i], 'N/A', 'green')
  );
}

type TrianglePredicate<T extends TriangleLike> = (tri: T) => boolean;
type TriangleEnough<T extends TriangleLike> = (tris: T[]) => boolean;

function generateTriangles<T extends TriangleLike>(
  triangles: T[],
  filt: TrianglePredicate<T>,
  enough: TriangleEnough<T>
): [T[], T[]] {
  const discarded: T[] = [];
  do {
    const new_triangles: T[] = [];
    for (const trig of triangles) new_triangles.push(...(trig.split() as T[]));
    triangles = new_triangles.filter((tri) => {
      if (filt(tri)) return true;
      discarded.push(tri);
      return false;
    });
  } while (triangles.length && !enough(triangles));
  return [triangles, discarded];
}

function lighten(color: string): string {
  switch (color) {
    case 'blue':
      return 'lightblue';
    case 'red':
      return 'pink';
  }
  console.log('unknown color to lighten', color);
  return color;
}

// unit-length edges

export function scaleVector(tl: Vector, scale: number): (v: Vector) => Vector {
  return (v) => new Vector((v.x - tl.x) * scale, (v.y - tl.y) * scale);
}

export function calculatePenroseTiling(
  minTiles: number,
  width: number,
  height: number,
  boundsShape: BoundsShape,
  startTile: TriangleKind,
  resolveRagged: ResolveRaggedMode,
  center?: Vector | null,
  r?: number | null
): PenroseTilingResult {
  const startTriangleFactory = {
    C: TathamTriangleC.startTile,
    D: TathamTriangleD.startTile,
    X: TathamTriangleX.startTile,
    Y: TathamTriangleY.startTile
  }[startTile];
  if (!startTriangleFactory) throw new Error(`Unknown start tile ${startTile}`);
  const startTriangle = startTriangleFactory(width, height);

  let polygon: Vector[] = [];
  let tilingCenter: Vector;
  let radius: number;

  if (center && typeof r === 'number') {
    tilingCenter = center;
    radius = r;
    polygon = regularPolygon(center, r, boundsShape);
  } else {
    const xExtent = extent([
      startTriangle.v1.x,
      startTriangle.v2.x,
      startTriangle.v3.x
    ]);
    const yExtent = extent([
      startTriangle.v1.y,
      startTriangle.v2.y,
      startTriangle.v3.y
    ]);
    const [xmin, xmax] = xExtent;
    const [ymin, ymax] = yExtent;
    if (
      xmin === undefined ||
      xmax === undefined ||
      ymin === undefined ||
      ymax === undefined
    )
      throw new Error('Unable to determine start triangle bounds');
    radius = randomUniform(width / 1000, width / 8)();
    let rTries = 5;
    let found = false;
    let currentCenter: Vector | null = null;
    do {
      const xrand = randomUniform(xmin + radius, xmax - radius);
      const yrand = randomUniform(ymin + radius, ymax - radius);
      let cTries = 10;
      do {
        const candidateCenter = new Vector(xrand(), yrand());
        const candidatePolygon = regularPolygon(
          candidateCenter,
          radius,
          boundsShape
        );
        found = candidatePolygon.every((pt) => startTriangle.pointInside(pt));
        if (found) {
          currentCenter = candidateCenter;
          polygon = candidatePolygon;
          break;
        }
      } while (--cTries && !found);
      if (!found) radius /= 2;
    } while (--rTries && !found);
    if (!found || !currentCenter) {
      console.log(
        "couldn't find polygon of radius",
        radius,
        'inside',
        startTriangle.v1.print(),
        startTriangle.v2.print(),
        startTriangle.v3.print()
      );
      throw new Error("Couldn't find polygon inside triangle");
    }
    tilingCenter = currentCenter;
    if (!polygon.length) throw new Error('Polygon generation failed');
  }
  const polyTris = triangulate(polygon);

  console.assert(!Number.isNaN(minTiles));
  let triangles: TathamTriangleType[] = [startTriangle];
  let discarded: TathamTriangleType[] = [];
  [triangles, discarded] = generateTriangles(
    triangles,
    (tri) => polyTris.some((ptri) => trianglesIntersect(ptri, tri)),
    (tris) => tris.length / 2 > minTiles
  );

  const trihash: Record<string, TathamTriangleType> = {};
  for (const t of triangles) trihash[t.coord] = t;
  const disind: number[] = [];
  const find_tris: string[] = [];
  for (const [i, t] of triangles.entries()) {
    const oh = tatham_neighbor_or_null(t.coord, 0);
    const neighbor = oh ? trihash[oh] : undefined;
    if (!oh || !neighbor) {
      if (resolveRagged === 'cull') disind.push(i);
      else if (resolveRagged === 'fill') {
        const nei1 = tatham_neighbor_or_null(t.coord, 1);
        const nei2 = tatham_neighbor_or_null(t.coord, 2);
        if (oh && nei1 && nei2 && trihash[nei1] && trihash[nei2])
          find_tris.push(oh);
        else disind.push(i);
      }
    }
  }
  let found_tris: TathamTriangleType[] = [];
  if (find_tris.length) {
    [found_tris] = generateTriangles(
      [startTriangle],
      (tri) => find_tris.some((find) => find.endsWith(tri.coord)),
      (tris) => !tris.length || tris[0].coord.length === find_tris[0].length
    );
    if (found_tris.length < find_tris.length) {
      console.log('did not find other halves of all sought triangles:');
      console.log('sought', find_tris);
      console.log(
        'found',
        found_tris.map(({ coord }) => coord)
      );
    }
    for (const tri of found_tris) trihash[tri.coord] = tri;
    triangles.push(...found_tris);
  }
  const tathamTrihash: Record<string, TathamTriangleType> = {};
  for (const t of triangles) tathamTrihash[t.coord] = t;
  const rhombhash: Record<string, RhombHashEntry> = {};
  const tri2rhomb: Record<string, string> = {};
  for (const t of triangles) {
    const oh = tatham_neighbor_or_null(t.coord, 0);
    const t2 = oh ? tathamTrihash[oh] : undefined;
    if (oh && t2) {
      const rhombcoord = [t.coord, oh].sort().join(',');
      if (rhombhash[rhombcoord]) continue;
      tri2rhomb[t.coord] = rhombcoord;
      tri2rhomb[oh] = rhombcoord;
      const fillColor =
        find_tris.includes(t.coord) || find_tris.includes(oh)
          ? lighten(t.fillColor)
          : t.fillColor;
      const rhombus = new Rhombus(
        t.v3,
        t.v2,
        t2.v3,
        t2.v2,
        rhombcoord,
        fillColor
      );
      rhombhash[rhombcoord] = {
        rhombus,
        tri1: toLegacyTriangle(t),
        tri2: toLegacyTriangle(t2),
        neighbors: [null, null, null, null],
        base: null
      };
    }
  }
  const culledTathamTris: TathamTriangleType[] = [];
  for (let i = disind.length - 1; i >= 0; i--) {
    const index = disind[i];
    if (index >= 0 && index < triangles.length) {
      culledTathamTris.push(triangles[index]);
      triangles.splice(index, 1);
    }
  }
  for (const [rhombcoord, { tri1, tri2 }] of Object.entries(rhombhash)) {
    const neighbors: Array<string | null> = [];
    for (const tri of [tri1, tri2])
      for (const side of [1, 2] as const) {
        const nei = tatham_neighbor_or_null(tri.coord, side);
        const rhombnei = nei ? (tri2rhomb[nei] ?? null) : null;
        neighbors.push(rhombnei);
      }
    rhombhash[rhombcoord].neighbors = neighbors;
  }
  for (const entry of Object.values(rhombhash)) {
    const vs = unitVectors(entry.rhombus);
    entry.key = rhomb_key(vs);
    const base = key_to_base[entry.key];
    entry.base = base !== undefined ? base : null;
  }
  const culledRhombs: Rhombus[] = [];
  if (resolveRagged === 'cull') {
    let cullRhombs: RhombHashEntry[] = [];
    do {
      cullRhombs = Object.values(rhombhash).filter(
        ({ neighbors }) =>
          neighbors.filter((n): n is string => Boolean(n)).length < 2
      );
      for (const { rhombus, neighbors } of cullRhombs) {
        culledRhombs.push(rhombus);
        for (const nei of neighbors) {
          if (!nei) continue;
          const entry = rhombhash[nei];
          if (!entry) continue;
          for (const idx of range(4))
            if (entry.neighbors[idx] === rhombus.coord)
              entry.neighbors[idx] = null;
        }
        delete rhombhash[rhombus.coord];
      }
    } while (cullRhombs.length);
  }
  discarded.concat(culledTathamTris).forEach((tri) => (tri.fillColor = 'none'));
  const elengths: number[] = [];
  for (const { rhombus: rh } of Object.values(rhombhash))
    for (const [v1, v2] of [
      [rh.v1, rh.v2],
      [rh.v2, rh.v3],
      [rh.v3, rh.v4],
      [rh.v4, rh.v1]
    ] as const)
      elengths.push(Math.hypot(v2.x - v1.x, v2.y - v1.y));
  const meanEdgeLength = mean(elengths);
  if (meanEdgeLength === undefined)
    throw new Error('Unable to determine mean edge length');
  const rhombuses = Object.values(rhombhash).map(({ rhombus }) => rhombus);
  if (!rhombuses.length) throw new Error('No rhombuses generated');
  const { tl } = calculateRhombusesBB(rhombuses);
  const scale = scaleVector(tl, 1 / meanEdgeLength);
  for (const rhombus of Object.values(rhombhash)) {
    const { rhombus: rh, tri1, tri2 } = rhombus;
    rh.v1 = scale(rh.v1);
    rh.v2 = scale(rh.v2);
    rh.v3 = scale(rh.v3);
    rh.v4 = scale(rh.v4);

    rhombus.tri1scale = new Triangle(
      scale(tri1.v1),
      scale(tri1.v2),
      scale(tri1.v3),
      tri1.coord,
      tri1.fillColor
    );

    rhombus.tri2scale = new Triangle(
      scale(tri2.v1),
      scale(tri2.v2),
      scale(tri2.v3),
      tri2.coord,
      tri2.fillColor
    );
  }
  for (const entry of Object.values(rhombhash)) {
    const rh = entry.rhombus;
    const cx = (rh.v1.x + rh.v3.x) / 2,
      cy = (rh.v1.y + rh.v3.y) / 2,
      cx2 = (rh.v2.x + rh.v4.x) / 2,
      cy2 = (rh.v2.y + rh.v4.y) / 2;
    console.assert(Math.abs(cx - cx2) < 1);
    console.assert(Math.abs(cy - cy2) < 1);
    entry.center = new Vector(cx, cy);
  }

  const not_found = new Set<string>(),
    bases_found = new Set<number>();
  for (const { key, base } of Object.values(rhombhash)) {
    if (key === undefined) continue;
    if (base !== null && base !== undefined) bases_found.add(base);
    else not_found.add(key);
  }
  for (const nf of not_found) console.log('not found', nf);
  for (const base of range(10))
    if (!bases_found.has(base))
      console.log('unused', base, base_to_key[base] ?? 'unknown');
  return {
    center: tilingCenter,
    r: radius,
    polygon,
    robinsonTriangles: triangles.map(toLegacyTriangle),
    discardedTriangles: discarded.map(toLegacyTriangle),
    culledTriangles: culledTathamTris.map(toLegacyTriangle),
    p3Rhombuses: rhombhash,
    culledRhombuses: culledRhombs,
    fillsIdentified: find_tris,
    fillsFound: found_tris.map(toLegacyTriangle),
    rhombBases: range(10),
    scaleFunction: scale
  };
}
