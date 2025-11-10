import {
    GOLDEN_RATIO,
    Vector,
    Triangle,
    TriangleC,
    TriangleD,
    TriangleX,
    TriangleY
} from './geometry';

function splitPoint(a, b) {
    return new Vector(
        a.x + (b.x - a.x) * GOLDEN_RATIO,
        a.y + (b.y - a.y) * GOLDEN_RATIO
    );
}

const DEG = Math.PI / 180;
const ROBINSON_RATIO = Math.sin(36 * DEG) / Math.sin(54 * DEG);

function createCDStartVertices(width, height) {
    const hei = Math.min(width * ROBINSON_RATIO, height);
    const halfBase = hei / (2 * ROBINSON_RATIO);
    return {
        v1: new Vector(width / 2 + halfBase, hei),
        v2: new Vector(width / 2 + halfBase, 0),
        v3: new Vector(width / 2 - halfBase, hei / 2)
    };
}

function createXYStartVertices(width, height) {
    const hei = Math.min((width / 2) * ROBINSON_RATIO, height);
    const offset = hei / ROBINSON_RATIO;
    return {
        v1: new Vector(width / 2 - offset, hei),
        v2: new Vector(width / 2 + offset, hei),
        v3: new Vector(width / 2, 0)
    };
}

class TathamTriangle extends Triangle {
    constructor(v1, v2, v3, coord, fillColor) {
        super(v1, v2, v3, coord, fillColor);
    }
}

export class TathamTriangleC extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    static startTile(width, height) {
        const {v1, v2, v3} = createCDStartVertices(width, height);
        return new TathamTriangleC(v1, v2, v3, 'C');
    }

    split() {
        const split1 = splitPoint(this.v3, this.v2);
        return [
            new TathamTriangleC(this.v2, split1, this.v1, 'C' + this.coord),
            new TathamTriangleY(this.v3, this.v1, split1, 'Y' + this.coord)
        ];
    }
}

export class TathamTriangleD extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    static startTile(width, height) {
        const {v1, v2, v3} = createCDStartVertices(width, height);
        return new TathamTriangleD(v1, v2, v3, 'D');
    }

    split() {
        const split2 = splitPoint(this.v3, this.v1);
        return [
            new TathamTriangleD(split2, this.v1, this.v2, 'D' + this.coord),
            new TathamTriangleX(this.v2, this.v3, split2, 'X' + this.coord)
        ];
    }
}

export class TathamTriangleX extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    static startTile(width, height) {
        const {v1, v2, v3} = createXYStartVertices(width, height);
        return new TathamTriangleX(v1, v2, v3, 'X');
    }

    split() {
        const split0 = splitPoint(this.v1, this.v2);
        const split2 = splitPoint(this.v1, this.v3);
        return [
            new TathamTriangleY(this.v1, split0, split2, 'Y' + this.coord),
            new TathamTriangleC(this.v3, split2, split0, 'C' + this.coord),
            new TathamTriangleX(this.v2, this.v3, split0, 'X' + this.coord)
        ];
    }
}

export class TathamTriangleY extends TathamTriangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    static startTile(width, height) {
        const {v1, v2, v3} = createXYStartVertices(width, height);
        return new TathamTriangleY(v1, v2, v3, 'Y');
    }

    split() {
        const split0 = splitPoint(this.v2, this.v1);
        const split1 = splitPoint(this.v2, this.v3);
        return [
            new TathamTriangleY(this.v3, this.v1, split0, 'Y' + this.coord),
            new TathamTriangleD(split1, this.v3, split0, 'D' + this.coord),
            new TathamTriangleX(split0, this.v2, split1, 'X' + this.coord)
        ];
    }
}

export function toLegacyTriangle(triangle) {
    if(triangle instanceof TathamTriangleC)
        return new TriangleC(triangle.v3, triangle.v2, triangle.v1, triangle.coord);
    if(triangle instanceof TathamTriangleD)
        return new TriangleD(triangle.v3, triangle.v2, triangle.v1, triangle.coord);
    if(triangle instanceof TathamTriangleX)
        return new TriangleX(triangle.v3, triangle.v2, triangle.v1, triangle.coord);
    if(triangle instanceof TathamTriangleY)
        return new TriangleY(triangle.v3, triangle.v2, triangle.v1, triangle.coord);
    throw new Error('Unsupported triangle supplied to toLegacyTriangle');
}
