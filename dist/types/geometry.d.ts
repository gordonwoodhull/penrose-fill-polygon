export type Point = {
    x: number;
    y: number;
};
export declare const GOLDEN_RATIO = 0.6180339887498949;
export declare class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number);
    static fromPoints(start: Point, end: Point): Vector;
    static fromJson(json: Point): Vector;
    print(xform?: (value: number) => number, yform?: (value: number) => number, prec?: number): string;
    multiply(multiplier: number): Vector;
    add(anotherVector: Vector): Vector;
    subtract(anotherVector: Vector): Vector;
}
export declare function average_vectors(...vs: Vector[]): Vector;
export declare function interpolate_vectors(a: Vector, b: Vector, t: number): Vector;
export interface TriangleLike {
    v1: Vector;
    v2: Vector;
    v3: Vector;
    coord: string;
    fillColor: string;
    pointInside(pt: Vector): boolean;
    center(): Vector;
    side(i: 0 | 1 | 2): [Vector, Vector] | null;
    split(): TriangleLike[];
}
export declare class Triangle implements TriangleLike {
    v1: Vector;
    v2: Vector;
    v3: Vector;
    coord: string;
    fillColor: string;
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string, fillColor: string);
    pointInside(pt: Vector): boolean;
    center(): Vector;
    side(i: 0 | 1 | 2): [Vector, Vector] | null;
    split(): Triangle[];
}
export declare class TriangleC extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    split(): Triangle[];
}
export declare class TriangleD extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    split(): Triangle[];
}
export declare class TriangleX extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    split(): Triangle[];
}
export declare class TriangleY extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    split(): Triangle[];
}
export declare const trianglesIntersect: (A: Triangle, B: Triangle) => boolean;
export declare const triangleListsIntersect: (As: Triangle[], Bs: Triangle[]) => boolean;
