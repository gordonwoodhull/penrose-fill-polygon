import {cross, sum} from 'd3-array';

export type Point = {x: number; y: number};

export const GOLDEN_RATIO = 0.6180339887498948482;

export class Vector {
    constructor(public x: number, public y: number) {}

    static fromPoints(start: Point, end: Point): Vector {
        return new Vector(end.x - start.x, end.y - start.y);
    }

    static fromJson(json: Point): Vector {
        return new Vector(json.x, json.y);
    }

    print(
        xform: (value: number) => number = x => x,
        yform: (value: number) => number = y => y,
        prec = 4
    ): string {
        return `${xform(this.x).toFixed(prec)}, ${yform(this.y).toFixed(prec)}`;
    }

    multiply(multiplier: number): Vector {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }

    add(anotherVector: Vector): Vector {
        return new Vector(this.x + anotherVector.x, this.y + anotherVector.y);
    }

    subtract(anotherVector: Vector): Vector {
        return new Vector(this.x - anotherVector.x, this.y - anotherVector.y);
    }
}

export function average_vectors(...vs: Vector[]): Vector {
    return new Vector(
        sum(vs, ({x}) => x)!/vs.length,
        sum(vs, ({y}) => y)!/vs.length
    );
}

export function interpolate_vectors(a: Vector, b: Vector, t: number): Vector {
    return new Vector(
        a.x + (b.x - a.x) * t,
        a.y + (b.y - a.y) * t
    );
}

function sign(v1: Vector, v2: Vector, v3: Vector): number {
    return (v1.x - v3.x) * (v2.y - v3.y) - (v2.x - v3.x) * (v1.y - v3.y);
}

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

export class Triangle implements TriangleLike {
    constructor(
        public v1: Vector,
        public v2: Vector,
        public v3: Vector,
        public coord: string,
        public fillColor: string
    ) {}

    pointInside(pt: Vector): boolean {
        const d1 = sign(pt, this.v1, this.v2);
        const d2 = sign(pt, this.v2, this.v3);
        const d3 = sign(pt, this.v3, this.v1);

        const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

        return !(has_neg && has_pos);
    }

    center(): Vector {
        return average_vectors(this.v1, this.v2, this.v3);
    }

    side(i: 0 | 1 | 2): [Vector, Vector] | null {
        return i === 0 ? [this.v2, this.v3] :
            i === 1 ? [this.v1, this.v2] :
            i === 2 ? [this.v3, this.v1] :
            null;
    }

    split(): Triangle[] {
        return [];
    }
}

// C
export class TriangleC extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string) {
        super(v1, v2, v3, coord, 'blue');
    }

    split(): Triangle[] {
        const vector_12 = Vector.fromPoints(this.v1, this.v2).multiply(GOLDEN_RATIO);
        const split_point_12 = this.v1.add(vector_12);

        const new_triangles: Triangle[] = [];
        new_triangles.push(new TriangleC(this.v3, split_point_12, this.v2, 'C' + this.coord));
        new_triangles.push(new TriangleY(split_point_12, this.v3, this.v1, 'Y' + this.coord));

        return new_triangles;
    }
}

// D
export class TriangleD extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string) {
        super(v1, v2, v3, coord, 'blue');
    }

    split(): Triangle[] {
        const vector_13 = Vector.fromPoints(this.v1, this.v3).multiply(GOLDEN_RATIO);
        const split_point_13 = this.v1.add(vector_13);

        const new_triangles: Triangle[] = [];
        new_triangles.push(new TriangleD(this.v2, this.v3, split_point_13, 'D' + this.coord));
        new_triangles.push(new TriangleX(split_point_13, this.v1, this.v2, 'X' + this.coord));

        return new_triangles;
    }
}

// X
export class TriangleX extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string) {
        super(v1, v2, v3, coord, 'red');
    }

    split(): Triangle[] {
        const vector_32 = Vector.fromPoints(this.v3, this.v2).multiply(GOLDEN_RATIO);
        const split_point_32 = this.v3.add(vector_32);

        const vector_31 = Vector.fromPoints(this.v3, this.v1).multiply(GOLDEN_RATIO);
        const split_point_31 = this.v3.add(vector_31);

        const new_triangles: Triangle[] = [];
        new_triangles.push(new TriangleY(split_point_31, split_point_32, this.v3, 'Y' + this.coord));
        new_triangles.push(new TriangleC(split_point_32, split_point_31, this.v1, 'C' + this.coord));
        new_triangles.push(new TriangleX(split_point_32, this.v1, this.v2, 'X' + this.coord));

        return new_triangles;
    }
}

// Y
export class TriangleY extends Triangle {
    constructor(v1: Vector, v2: Vector, v3: Vector, coord: string) {
        super(v1, v2, v3, coord, 'red');
    }

    split(): Triangle[] {
        const vector_21 = Vector.fromPoints(this.v2, this.v1).multiply(GOLDEN_RATIO);
        const split_point_21 = this.v2.add(vector_21);

        const vector_23 = Vector.fromPoints(this.v2, this.v3).multiply(GOLDEN_RATIO);
        const split_point_23 = this.v2.add(vector_23);

        const new_triangles: Triangle[] = [];
        new_triangles.push(new TriangleY(split_point_23, this.v3, this.v1, 'Y' + this.coord));
        new_triangles.push(new TriangleD(split_point_23, this.v1, split_point_21, 'D' + this.coord));
        new_triangles.push(new TriangleX(split_point_21, this.v2, split_point_23, 'X' + this.coord));

        return new_triangles;
    }
}

const cross2 = function(A: Triangle, B: Triangle): boolean {
    const a1 = A.v1;
    const a2 = A.v2;
    const a3 = A.v3;
    const b1 = B.v1;
    const b2 = B.v2;
    const b3 = B.v3;
    const dXa = a1.x - b3.x;
    const dYa = a1.y - b3.y;
    const dXb = a2.x - b3.x;
    const dYb = a2.y - b3.y;
    const dXc = a3.x - b3.x;
    const dYc = a3.y - b3.y;
    const dX21 = b3.x - b2.x;
    const dY12 = b2.y - b3.y;
    const D = dY12 * (b1.x - b3.x) + dX21 * (b1.y - b3.y);
    const sa = dY12 * dXa + dX21 * dYa;
    const sb = dY12 * dXb + dX21 * dYb;
    const sc = dY12 * dXc + dX21 * dYc;
    const ta = (b3.y - b1.y) * dXa + (b1.x - b3.x) * dYa;
    const tb = (b3.y - b1.y) * dXb + (b1.x - b3.x) * dYb;
    const tc = (b3.y - b1.y) * dXc + (b1.x - b3.x) * dYc;
    if (D < 0) return ((sa >= 0 && sb >= 0 && sc >= 0) ||
                       (ta >= 0 && tb >= 0 && tc >= 0) ||
                       (sa+ta <= D && sb+tb <= D && sc+tc <= D));
    return ((sa <= 0 && sb <= 0 && sc <= 0) ||
            (ta <= 0 && tb <= 0 && tc <= 0) ||
            (sa+ta >= D && sb+tb >= D && sc+tc >= D));
};

export const trianglesIntersect = function(A: Triangle, B: Triangle): boolean {
    return !(cross2(A, B) ||
             cross2(B, A));
};

export const triangleListsIntersect = function(As: Triangle[], Bs: Triangle[]): boolean {
    return cross(As, Bs).some(([A, B]) => trianglesIntersect(A, B));
};
