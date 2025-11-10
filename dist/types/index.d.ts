import { Vector, Triangle, type Point } from './geometry';
type TriangleKind = 'C' | 'D' | 'X' | 'Y';
type BoundsShape = 'square' | 'pentagon' | 'hexagon';
type ResolveRaggedMode = 'none' | 'cull' | 'fill';
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
export { GOLDEN_RATIO, Vector, Triangle, TriangleC, TriangleD, TriangleX, TriangleY, trianglesIntersect, triangleListsIntersect, average_vectors, interpolate_vectors } from './geometry';
export declare class Rhombus {
    v1: Vector;
    v2: Vector;
    v3: Vector;
    v4: Vector;
    coord: string;
    fillColor: string;
    constructor(v1: Vector, v2: Vector, v3: Vector, v4: Vector, coord: string, fillColor: string);
    getTriangles(): [Triangle, Triangle];
    getPoints(): [Vector, Vector, Vector, Vector];
    side(i: 0 | 1 | 2 | 3): [Vector, Vector] | null;
    static fromJson(json: {
        v1: Point;
        v2: Point;
        v3: Point;
        v4: Point;
        coord: string;
        fillColor: string;
    }): Rhombus;
}
export declare function tatham_neighbor(coord: string, side: 0 | 1 | 2): [string, 0 | 1 | 2];
export declare function tatham_neighbor_or_null(coord: string, side: 0 | 1 | 2): string | null;
export declare function calculateBaseRhombuses(): RhombusVectors[];
export declare const truncate_float: (prec: number) => (x: number) => string;
type RhombusVectors = [Vector, Vector, Vector, Vector];
export declare function rhomb_key(vs: Rhombus | RhombusVectors, prec?: number): string;
export declare function calculateTrianglesBB(tris: Triangle[]): {
    tl: Vector;
    br: Vector;
};
export declare function calculateRhombusesBB(rhombs: Rhombus[]): {
    tl: Vector;
    br: Vector;
};
export declare function scaleVector(tl: Vector, scale: number): (v: Vector) => Vector;
export declare function calculatePenroseTiling(minTiles: number, width: number, height: number, boundsShape: BoundsShape, startTile: TriangleKind, resolveRagged: ResolveRaggedMode, center?: Vector | null, r?: number | null): PenroseTilingResult;
