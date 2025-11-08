export declare var trianglesIntersect: (A: any, B: any) => boolean;
export declare var triangleListsIntersect: (As: any, Bs: any) => any;
export declare class Vector {
    constructor(x: any, y: any);
    static fromPoints(start: any, end: any): Vector;
    static fromJson(json: any): Vector;
    print(xform: any, yform: any, prec?: number): string;
    multiply(multiplier: any): Vector;
    add(anotherVector: any): Vector;
    subtract(anotherVector: any): Vector;
}
export declare function average_vectors(...vs: any[]): Vector;
export declare function interpolate_vectors(a: any, b: any, t: any): Vector;
export declare class Triangle {
    constructor(v1: any, v2: any, v3: any, coord: any, fillColor: any);
    pointInside(pt: any): boolean;
    center(): Vector;
    side(i: any): any[];
}
export declare class TriangleC extends Triangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    split(): any[];
}
export declare class TriangleD extends Triangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    split(): any[];
}
export declare class TriangleX extends Triangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    split(): any[];
}
export declare class TriangleY extends Triangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    split(): any[];
}
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
