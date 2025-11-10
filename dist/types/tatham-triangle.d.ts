import { Triangle, TriangleC, TriangleD, TriangleX, TriangleY } from './geometry';
declare class TathamTriangle extends Triangle {
    constructor(v1: any, v2: any, v3: any, coord: any, fillColor: any);
}
export declare class TathamTriangleC extends TathamTriangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    static startTile(width: any, height: any): TathamTriangleC;
    split(): (TathamTriangleC | TathamTriangleY)[];
}
export declare class TathamTriangleD extends TathamTriangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    static startTile(width: any, height: any): TathamTriangleD;
    split(): (TathamTriangleD | TathamTriangleX)[];
}
export declare class TathamTriangleX extends TathamTriangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    static startTile(width: any, height: any): TathamTriangleX;
    split(): (TathamTriangleC | TathamTriangleY | TathamTriangleX)[];
}
export declare class TathamTriangleY extends TathamTriangle {
    constructor(v1: any, v2: any, v3: any, coord: any);
    static startTile(width: any, height: any): TathamTriangleY;
    split(): (TathamTriangleY | TathamTriangleD | TathamTriangleX)[];
}
export declare function toLegacyTriangle(triangle: any): TriangleC | TriangleY | TriangleD | TriangleX;
export {};
