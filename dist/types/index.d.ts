import { Vector, Triangle, TriangleC, TriangleD, TriangleX, TriangleY, type Point, type TriangleLike } from './geometry';
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
export declare function tatham_neighbor(coord: string, side: 0 | 1 | 2): [string, number];
export declare function tatham_neighbor_or_null(coord: string, side: 0 | 1 | 2): string | null;
export declare function calculateBaseRhombuses(): Vector[][];
export declare const truncate_float: (prec: any) => (x: any) => any;
export declare function rhomb_key(vs: any, prec?: number): any;
export declare function calculateTrianglesBB(tris: any): {
    tl: Vector;
    br: Vector;
};
export declare function calculateRhombusesBB(rhombs: any): {
    tl: Vector;
    br: Vector;
};
export declare function scaleVector(tl: any, scale: any): (v: any) => Vector;
export declare function calculatePenroseTiling(minTiles: any, width: any, height: any, boundsShape: any, startTile: any, resolveRagged: any, center: any, r: any): {
    center: any;
    r: any;
    polygon: Vector[];
    robinsonTriangles: any[];
    discardedTriangles: (TriangleC | TriangleY | TriangleD | TriangleX)[];
    culledTriangles: any[];
    p3Rhombuses: {};
    culledRhombuses: any[];
    fillsIdentified: string[];
    fillsFound: TriangleLike;
    rhombBases: number[];
    scaleFunction: (v: any) => Vector;
};
