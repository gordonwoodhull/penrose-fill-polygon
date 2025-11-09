import {
    GOLDEN_RATIO,
    Vector,
    Triangle,
    TriangleC,
    TriangleD,
    TriangleX,
    TriangleY
} from './geometry';

const splitPoint = (start, end) =>
    start.add(Vector.fromPoints(start, end).multiply(GOLDEN_RATIO));

class TathamTriangle extends Triangle {
    constructor(v1, v2, v3, coord, fillColor) {
        super(v1, v2, v3, coord, fillColor);
    }
}

export class TathamTriangleC extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    split() {
        const split12 = splitPoint(this.v1, this.v2);
        return [
            new TathamTriangleC(this.v3, split12, this.v2, 'C' + this.coord),
            new TathamTriangleY(split12, this.v3, this.v1, 'Y' + this.coord)
        ];
    }
}

export class TathamTriangleD extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    split() {
        const split13 = splitPoint(this.v1, this.v3);
        return [
            new TathamTriangleD(this.v2, this.v3, split13, 'D' + this.coord),
            new TathamTriangleX(split13, this.v1, this.v2, 'X' + this.coord)
        ];
    }
}

export class TathamTriangleX extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    split() {
        const split32 = splitPoint(this.v3, this.v2);
        const split31 = splitPoint(this.v3, this.v1);
        return [
            new TathamTriangleY(split31, split32, this.v3, 'Y' + this.coord),
            new TathamTriangleC(split32, split31, this.v1, 'C' + this.coord),
            new TathamTriangleX(split32, this.v1, this.v2, 'X' + this.coord)
        ];
    }
}

export class TathamTriangleY extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    split() {
        const split21 = splitPoint(this.v2, this.v1);
        const split23 = splitPoint(this.v2, this.v3);
        return [
            new TathamTriangleY(split23, this.v3, this.v1, 'Y' + this.coord),
            new TathamTriangleD(split23, this.v1, split21, 'D' + this.coord),
            new TathamTriangleX(split21, this.v2, split23, 'X' + this.coord)
        ];
    }
}

export function toLegacyTriangle(triangle) {
    if(triangle instanceof TathamTriangleC)
        return new TriangleC(triangle.v1, triangle.v2, triangle.v3, triangle.coord);
    if(triangle instanceof TathamTriangleD)
        return new TriangleD(triangle.v1, triangle.v2, triangle.v3, triangle.coord);
    if(triangle instanceof TathamTriangleX)
        return new TriangleX(triangle.v1, triangle.v2, triangle.v3, triangle.coord);
    if(triangle instanceof TathamTriangleY)
        return new TriangleY(triangle.v1, triangle.v2, triangle.v3, triangle.coord);
    throw new Error('Unsupported triangle supplied to toLegacyTriangle');
}
