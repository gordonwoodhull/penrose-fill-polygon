import { range, mean } from 'd3-array';

import { Vector, Rhombus } from './geometry';

export type RhombusVectors = [Vector, Vector, Vector, Vector];

export const truncate_float =
  (prec: number) =>
  (x: number): string =>
    Math.abs(x) < 10 ** -prec ? (0).toFixed(prec) : x.toFixed(prec);

export function rhomb_key(vs: Rhombus | RhombusVectors, prec = 10): string {
  const vectors: RhombusVectors =
    vs instanceof Rhombus ? [vs.v1, vs.v2, vs.v3, vs.v4] : vs;
  const trunc = truncate_float(prec);
  return vectors.flatMap((v) => [trunc(v.x), trunc(v.y)]).join(',');
}

export function unitVectors(rh: Rhombus): RhombusVectors {
  const lengths: number[] = [];
  for (const [v1, v2] of [
    [rh.v1, rh.v2],
    [rh.v2, rh.v3],
    [rh.v3, rh.v4],
    [rh.v4, rh.v1]
  ] as const)
    lengths.push(Math.hypot(v2.x - v1.x, v2.y - v1.y));
  const localMean = mean(lengths);
  if (!localMean) return [rh.v1, rh.v2, rh.v3, rh.v4];
  const factor = 1 / localMean;
  const scaled = [rh.v1, rh.v2, rh.v3, rh.v4].map(
    ({ x, y }) => new Vector(x * factor, y * factor)
  ) as RhombusVectors;
  const cx = (scaled[0].x + scaled[2].x) / 2;
  const cy = (scaled[0].y + scaled[2].y) / 2;
  return [
    new Vector(scaled[0].x - cx, scaled[0].y - cy),
    new Vector(scaled[1].x - cx, scaled[1].y - cy),
    new Vector(scaled[2].x - cx, scaled[2].y - cy),
    new Vector(scaled[3].x - cx, scaled[3].y - cy)
  ];
}

export function calculateBaseRhombuses(): RhombusVectors[] {
  const TAU = 2 * Math.PI;
  const cos36_2 = Math.cos(TAU / 10) / 2,
    sin36_2 = Math.sin(TAU / 10) / 2;
  const cos72_2 = Math.cos(TAU / 5) / 2,
    sin72_2 = Math.sin(TAU / 5) / 2;
  const rhomb0: RhombusVectors = [
    new Vector(0.5 - cos72_2, -sin72_2),
    new Vector(0.5 + cos72_2, sin72_2),
    new Vector(cos72_2 - 0.5, sin72_2),
    new Vector(-0.5 - cos72_2, -sin72_2)
  ];
  const rhomb9: RhombusVectors = [
    new Vector(0.5 + cos36_2, sin36_2),
    new Vector(cos36_2 - 0.5, sin36_2),
    new Vector(-0.5 - cos36_2, -sin36_2),
    new Vector(0.5 - cos36_2, -sin36_2)
  ];

  const rots = [
    0,
    TAU / 5,
    (TAU * 2) / 5,
    (TAU * 3) / 5,
    (TAU * 4) / 5,
    (TAU * 2) / 10,
    -TAU / 10,
    (-TAU * 4) / 10,
    (TAU * 3) / 10,
    0
  ];
  return range(20).map((i) => {
    const rhomb = i % 10 < 5 ? rhomb0 : rhomb9;
    const rot = i < 10 ? rots[i] : rots[i - 10] + TAU / 2;
    const rv = rhomb.map(
      ({ x, y }) =>
        new Vector(
          x * Math.cos(rot) - y * Math.sin(rot),
          -(x * Math.sin(rot) + y * Math.cos(rot))
        )
    ) as RhombusVectors;
    return [rv[0], rv[3], rv[2], rv[1]] as RhombusVectors;
  });
}

export const base_rhombuses = calculateBaseRhombuses();
export const key_to_base: Record<string, number> = {};
export const base_to_key: string[] = [];

for (const [i, rh] of base_rhombuses.entries()) {
  const key = rhomb_key(rh);
  key_to_base[key] = i;
  base_to_key.push(key);
}
