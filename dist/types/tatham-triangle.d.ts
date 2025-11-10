import { Vector, Triangle } from './geometry';
declare class TathamTriangle extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string, fillColor: string);
}
export declare class TathamTriangleC extends TathamTriangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    static startTile(width: number, height: number): TathamTriangleC;
    split(): TathamTriangle[];
}
export declare class TathamTriangleD extends TathamTriangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    static startTile(width: number, height: number): TathamTriangleD;
    split(): TathamTriangle[];
}
export declare class TathamTriangleX extends TathamTriangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    static startTile(width: number, height: number): TathamTriangleX;
    split(): TathamTriangle[];
}
export declare class TathamTriangleY extends TathamTriangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string);
    static startTile(width: number, height: number): TathamTriangleY;
    split(): TathamTriangle[];
}
export declare function toLegacyTriangle(triangle: TathamTriangleC | TathamTriangleD | TathamTriangleX | TathamTriangleY): Triangle;
export {};
