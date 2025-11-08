import { Vector, Triangle } from './geometry';
export { GOLDEN_RATIO, Vector, Triangle, TriangleC, TriangleD, TriangleX, TriangleY, trianglesIntersect, triangleListsIntersect, average_vectors, interpolate_vectors } from './geometry';
export declare class Rhombus {
    constructor(v1: any, v2: any, v3: any, v4: any, coord: any, fillColor: any);
    getTriangles(): Triangle[];
    getPoints(): any[];
    side(i: any): any[];
    static fromJson(json: any): Rhombus;
}
export declare function tatham_neighbor(coord: any, side: any): any;
export declare function tatham_neighbor_or_null(coord: any, side: any): any;
export declare function calculateBaseRhombuses(): any;
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
    polygon: any;
    robinsonTriangles: any[];
    discardedTriangles: any;
    culledTriangles: any[];
    p3Rhombuses: {};
    culledRhombuses: any[];
    fillsIdentified: any[];
    fillsFound: any[];
    rhombBases: any;
    scaleFunction: (v: any) => Vector;
};
