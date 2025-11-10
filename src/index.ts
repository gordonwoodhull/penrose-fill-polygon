import {range, min, max, extent, mean, deviation} from 'd3-array';
import {randomUniform} from 'd3-random';
import {
    GOLDEN_RATIO,
    Vector,
    Triangle,
    TriangleC,
    TriangleD,
    TriangleX,
    TriangleY,
    trianglesIntersect,
    triangleListsIntersect,
    average_vectors,
    interpolate_vectors,
    type Point,
    type TriangleLike
} from './geometry';
import {
    TathamTriangleC,
    TathamTriangleD,
    TathamTriangleX,
    TathamTriangleY,
    toLegacyTriangle
} from './tatham-triangle';

export {
    GOLDEN_RATIO,
    Vector,
    Triangle,
    TriangleC,
    TriangleD,
    TriangleX,
    TriangleY,
    trianglesIntersect,
    triangleListsIntersect,
    average_vectors,
    interpolate_vectors
} from './geometry';

export class Rhombus {
    constructor(
        public v1: Vector,
        public v2: Vector,
        public v3: Vector,
        public v4: Vector,
        public coord: string,
        public fillColor: string
    ) {}

    getTriangles(): [Triangle, Triangle] {
        return [
            new Triangle(this.v1, this.v2, this.v3, this.coord, this.fillColor),
            new Triangle(this.v3, this.v4, this.v1, this.coord, this.fillColor)
        ];
    }

    getPoints(): [Vector, Vector, Vector, Vector] {
        return [this.v1, this.v2, this.v3, this.v4];
    }

    side(i: 0 | 1 | 2 | 3): [Vector, Vector] | null {
        return i === 0 ? [this.v1, this.v2] :
            i === 1 ? [this.v2, this.v3] :
            i === 2 ? [this.v3, this.v4] :
            i === 3 ? [this.v4, this.v1] :
            null;
    }

    static fromJson(json: {v1: Point; v2: Point; v3: Point; v4: Point; coord: string; fillColor: string}): Rhombus {
        const {v1, v2, v3, v4, coord, fillColor} = json;
        return new Rhombus(
            Vector.fromJson(v1),
            Vector.fromJson(v2),
            Vector.fromJson(v3),
            Vector.fromJson(v4),
            coord,
            fillColor
        );
    }
}

type TriangleKind = 'C' | 'D' | 'X' | 'Y';
type ExternalNeighbor = {external: true; side: 0 | 1 | 2; hand?: 'l' | 'r'};
type InternalNeighbor = {prefix: TriangleKind; enter: 0 | 1 | 2};
type Neighbor = ExternalNeighbor | InternalNeighbor;

const rtri_neighbors: Record<string, Record<0 | 1 | 2, Neighbor>> = {
    CC: {
        0: {external: true, side: 1, hand: 'r'},
        1: {prefix: 'Y', enter: 1},
        2: {external: true, side: 0}
    },
    YC: {
        0: {external: true, side: 2},
        1: {prefix: 'C', enter: 1},
        2: {external: true, side: 1, hand: 'l'}
    },
    XD: {
        0: {external: true, side: 1},
        1: {external: true, side: 2, hand: 'r'},
        2: {prefix: 'D', enter: 2}
    },
    DD: {
        0: {external: true, side: 2, hand: 'l'},
        1: {external: true, side: 0},
        2: {prefix: 'X', enter: 2}
    },
    YX: {
        0: {external: true, side: 0, hand: 'r'},
        1: {prefix: 'C', enter: 1},
        2: {external: true, side: 2, hand: 'l'}
    },
    CX: {
        0: {external: true, side: 2, hand: 'r'},
        1: {prefix: 'Y', enter: 1},
        2: {prefix: 'X', enter: 1}
    },
    XX: {
        0: {external: true, side: 1},
        1: {prefix: 'C', enter: 2},
        2: {external: true, side: 0, hand: 'l'}
    },
    YY: {
        0: {external: true, side: 2},
        1: {external: true, side: 0, hand: 'r'},
        2: {prefix: 'D', enter: 1}
    },
    DY: {
        0: {external: true, side: 1, hand: 'l'},
        1: {prefix: 'Y', enter: 2},
        2: {prefix: 'X', enter: 2}
    },
    XY: {
        0: {external: true, side: 0, hand: 'l'},
        1: {external: true, side: 1, hand: 'r'},
        2: {prefix: 'D', enter: 2}
    }
} as const;

const other_hand: Record<'l' | 'r', 'l' | 'r'> = {
    l: 'r',
    r: 'l'
} as const;

type WholeSide = {w: {part: TriangleKind; side: 0 | 1 | 2}};
type SplitSide = {l: {part: TriangleKind; side: 0 | 1 | 2}; r: {part: TriangleKind; side: 0 | 1 | 2}};
type EntryDirection = WholeSide | SplitSide;

const rtri_entries: Record<TriangleKind, Record<0 | 1 | 2, EntryDirection>> = {
    C: {
        0: {w: {part: 'C', side: 2}},
        1: {l: {part: 'Y', side: 2}, r: {part: 'C', side: 0}},
        2: {w: {part: 'Y', side: 0}}
    },
    D: {
        0: {w: {part: 'D', side: 1}},
        1: {w: {part: 'X', side: 0}},
        2: {l: {part: 'D', side: 0}, r: {part: 'X', side: 1}}
    },
    X: {
        0: {l: {part: 'X', side: 2}, r: {part: 'Y', side: 0}},
        1: {w: {part: 'X', side: 0}},
        2: {l: {part: 'Y', side: 2}, r: {part: 'C', side: 0}}
    },
    Y: {
        0: {l: {part: 'X', side: 0}, r: {part: 'Y', side: 1}},
        1: {l: {part: 'D', side: 0}, r: {part: 'X', side: 1}},
        2: {w: {part: 'Y', side: 0}}
    }
};

type NeighborKey = keyof typeof rtri_neighbors;
type EntryKey = keyof typeof rtri_entries;

export function tatham_neighbor(coord: string, side: 0 | 1 | 2): [string, number] {
    if(coord.length < 2)
        throw new Error("no neighbor");
    const pre2 = coord.slice(0, 2);
    const neighbors = rtri_neighbors[pre2 as NeighborKey];
    if(!neighbors)
        throw new Error(`unknown prefix ${pre2}`);
    const nei = neighbors[side];
    if('external' in nei && nei.external) {
        const [parent, pside] = tatham_neighbor(coord.slice(1), nei.side as 0 | 1 | 2);
        const prefix = parent[0] as EntryKey;
        const enter = rtri_entries[prefix][pside as 0 | 1 | 2];
        let part: string;
        let nextSide: number;
        if(nei.hand) {
            if('l' in enter) {
                ({part, side: nextSide} = enter[other_hand[nei.hand]]);
            } else throw new Error('expected handed entry');
        } else {
            if('w' in enter) {
                ({part, side: nextSide} = enter.w);
            } else throw new Error('expected wedge entry');
        }
        return [part + parent, nextSide];
    }
    else {
        return [nei.prefix + coord.slice(1), nei.enter];
    }
}

export function tatham_neighbor_or_null(coord: string, side: 0 | 1 | 2): string | null {
    try {
        return tatham_neighbor(coord, side)[0];
    }
    catch(xep) {
        console.warn('no neighbor', side, 'for', coord);
        return null;
    }
}

const shape_spec = {
    square: {
        sides: 4,
        offset: 0.5
    },
    pentagon: {
        sides: 5,
        offset: -0.25
    },
    hexagon: {
        sides: 6,
        offset: 0
    }
} as const;

function regularPolygon(center: Vector, r: number, shape: keyof typeof shape_spec): Vector[] {
    const {sides, offset} = shape_spec[shape];
    const thetas = range(offset ?? 0, sides, 1).map(v => v * 2 * Math.PI / sides);
    return thetas.map(theta => new Vector(Math.cos(theta)*r + center.x, Math.sin(theta)*r + center.y));
}

function triangulate(polygon: Vector[]): Triangle[] {
    return range(2, polygon.length).map(i => new Triangle(polygon[0], polygon[i-1], polygon[i], 'N/A', 'green'));
}

type TrianglePredicate<T extends TriangleLike> = (tri: T) => boolean;
type TriangleEnough<T extends TriangleLike> = (tris: T[]) => boolean;

function generateTriangles<T extends TriangleLike>(
    triangles: T[],
    filt: TrianglePredicate<T>,
    enough: TriangleEnough<T>
): [T[], T[]] {
    const discarded: T[] = [];
    do {
        const new_triangles: T[] = [];
        for (const trig of triangles)
            new_triangles.push(...trig.split() as T[]);
        triangles = new_triangles.filter(tri => {
            if(filt(tri))
                return true;
            discarded.push(tri);
            return false;
        });
    }
    while(triangles.length && !enough(triangles));
    return [triangles, discarded];
}

function lighten(color: string): string {
    switch(color) {
    case 'blue':
        return 'lightblue';
    case 'red':
        return 'pink';
    }
    console.log('unknown color to lighten', color);
    return color;
}

// unit-length edges
export function calculateBaseRhombuses() {
    const TAU = 2*Math.PI;
    const cos36_2 = Math.cos(TAU/10) / 2,
          sin36_2 = Math.sin(TAU/10) / 2;
    const cos72_2 = Math.cos(TAU/5) / 2,
          sin72_2 = Math.sin(TAU/5) / 2;
    // the easiest rotations to do the trig
    //      -------
    //     /     /
    //    /     /
    //   -------
    const rhomb0 = [
        new Vector(0.5 - cos72_2, -sin72_2),
        new Vector(0.5 + cos72_2, sin72_2),
        new Vector(cos72_2 - 0.5, sin72_2),
        new Vector(-0.5 - cos72_2, -sin72_2)
    ];
    const rhomb9 = [
        new Vector(0.5 + cos36_2, sin36_2),
        new Vector(cos36_2 - 0.5, sin36_2),
        new Vector(-0.5 - cos36_2, -sin36_2),
        new Vector(0.5 - cos36_2, -sin36_2)
    ];

    const rots = [0, TAU/5, TAU*2/5, TAU*3/5, TAU*4/5,
                  TAU*2/10, -TAU/10, -TAU*4/10, TAU*3/10, 0];
    return range(20)
        .map(i => {
	    // above prototype coords are y increasing upward
	    // we must flip results and reverse order while still starting at apex
	    const rhomb = i%10 < 5 ? rhomb0 : rhomb9;
	    const rot = i < 10 ? rots[i] : rots[i-10] + TAU/2;
	    const rv = rhomb.map(({x,y}) =>
		new Vector(
                    x * Math.cos(rot) - y * Math.sin(rot),
                    -(x * Math.sin(rot) + y * Math.cos(rot))
		));
	    return [rv[0], rv[3], rv[2], rv[1]];
	});
}
let base_rhombuses = calculateBaseRhombuses();



export const truncate_float = prec => x => Math.abs(x) < 10 ** -prec ? 0..toFixed(prec) : x.toFixed(prec);

export function rhomb_key(vs, prec = 10) {
    if(vs instanceof Rhombus)
        vs = [vs.v1, vs.v2, vs.v3, vs.v4];
    const trunc = truncate_float(prec);
    return vs.flatMap(v => [trunc(v.x), trunc(v.y)]).join(',');
}

export function calculateTrianglesBB(tris) {
    const tl = new Vector(
        min(tris, tri => min([tri.v1.x, tri.v2.x, tri.v3.x])),
        min(tris, tri => min([tri.v1.y, tri.v2.y, tri.v3.y])));
    const br = new Vector(
        max(tris, tri => max([tri.v1.x, tri.v2.x, tri.v3.x])),
        max(tris, tri => max([tri.v1.y, tri.v2.y, tri.v3.y])));
    return {tl, br};
}

export function calculateRhombusesBB(rhombs) {
    const tl = new Vector(
        min(rhombs, rhomb => min([rhomb.v1.x, rhomb.v2.x, rhomb.v3.x, rhomb.v4.x])),
        min(rhombs, rhomb => min([rhomb.v1.y, rhomb.v2.y, rhomb.v3.y, rhomb.v4.y])));
    const br = new Vector(
        max(rhombs, rhomb => max([rhomb.v1.x, rhomb.v2.x, rhomb.v3.x, rhomb.v4.x])),
        max(rhombs, rhomb => max([rhomb.v1.y, rhomb.v2.y, rhomb.v3.y, rhomb.v4.y])));
    return {tl, br};
}

export function scaleVector(tl, scale) {
    return v => {
        return new Vector(
            (v.x - tl.x) * scale,
            (v.y - tl.y) * scale);
    };
}

export function calculatePenroseTiling(minTiles, width, height, boundsShape, startTile, resolveRagged, center, r) {
    const startTriangle = {
        C: TathamTriangleC.startTile,
        D: TathamTriangleD.startTile,
        X: TathamTriangleX.startTile,
        Y: TathamTriangleY.startTile
    }[startTile]?.(width, height);
    if(!startTriangle)
        throw new Error(`Unknown start tile ${startTile}`);
    var triangles = [startTriangle], polygon;
    if(center && r)
        polygon = regularPolygon(center, r, boundsShape);
    else {
        const [xmin, xmax] = extent([startri.v1.x, startri.v2.x, startri.v3.x]);
        const [ymin, ymax] = extent([startri.v1.y, startri.v2.y, startri.v3.y]);
        r = randomUniform(width/1000, width/8)();
        let r_tries = 5, found = false;
        do {
            let xrand = randomUniform(xmin + r, xmax - r),
                yrand = randomUniform(ymin + r, ymax - r);
            let c_tries = 10;
            do {
                center = new Vector(xrand(), yrand());
                polygon = regularPolygon(center, r, boundsShape);
                found = polygon.every(pt => startri.pointInside(pt));
            } while(--c_tries && !found);
            if(!found)
                r /= 2;
        }
        while(--r_tries && !found)
        if(!r_tries) {
            console.log("couldn't find polygon of radius", r, "inside", startri.v1.print(), startri.v2.print(), startri.v3.print());
            throw new Error("Couldn't find polygon inside triangle");
        }
    }
    const polyTris = triangulate(polygon);

    console.assert(!isNaN(minTiles));
    var discarded;
    [triangles, discarded] = generateTriangles(
        triangles,
        tri => polyTris.some(ptri => trianglesIntersect(ptri, tri)),
        tris => tris.length / 2 > minTiles);

    let trihash = {};
    for(var t of triangles)
        trihash[t.coord] = t;
    const disind = [];
    const find_tris = [];
    for(var [i, t] of triangles.entries()) {
        var oh = tatham_neighbor_or_null(t.coord, 0);
        var t2;
        if(!oh || !(t2 = trihash[oh])) {
            if(resolveRagged === "cull")
                disind.push(i);
            else if(resolveRagged === "fill") {
                var nei1 = tatham_neighbor_or_null(t.coord, 1),
                    nei2 = tatham_neighbor_or_null(t.coord, 2);
                if(oh && nei1 && nei2 && trihash[nei1] && trihash[nei2])
                    find_tris.push(oh);
                else
                    disind.push(i);
            }
        }
    }
    var found_tris : TriangleLike = [];
    if(find_tris.length) {
        [found_tris] = generateTriangles(
            [startri],
            tri => find_tris.some(find => find.endsWith(tri.coord)),
            tris => !tris.length || tris[0].coord.length === find_tris[0].length);
        if(found_tris.length < find_tris.length) {
            console.log('did not find other halves of all sought triangles:');
            console.log('sought', find_tris);
            console.log('found', found_tris.map(({coord}) => coord));
        }
        for(const tri of found_tris)
            trihash[tri.coord] = tri;
        triangles.push(...found_tris);
    }
    triangles = triangles.map(toLegacyTriangle);
    discarded = discarded.map(toLegacyTriangle);
    trihash = {};
    for(var t of triangles)
        trihash[t.coord] = t;
    const rhombhash = {};
    const tri2rhomb = {};
    for(var [_, t] of triangles.entries()) {
        var oh = tatham_neighbor_or_null(t.coord, 0);
        var t2;
        if(oh && (t2 = trihash[oh])) {
            const rhombcoord = [t.coord, oh].sort().join(',');
            if(rhombhash[rhombcoord])
                continue;
            else {
                // things that are arbitrary / not thought out here
                // original triangles are not using tatham side convention (see ll134-8)
                // there are two ways to choose the points from the triangles
                // this code is not using the sorted order of the triangles
                // that is used for the rhombcoord above

                // right away right here we need to
                //   * calculate the base and flip
                //   * rationalize the triangle
                //   * pull correct sides from triangles for base and flip
                // there can be tables that say from this base, flip, and rhomb side
                // you will get tri 1 or 2 and side 1 or 2
                // below neighbor calc use same
                // scale is unaffected
                // or since scale is needed for key and base/flip, maybe calculate everything at once here

                tri2rhomb[t.coord] = rhombcoord;
                tri2rhomb[oh] = rhombcoord;
                const fillColor = (find_tris.includes(t.coord) || find_tris.includes(oh)) ?
                      lighten(t.fillColor) : t.fillColor;
                const rhombus = new Rhombus(t.v1, t.v2, t2.v1, t2.v2, rhombcoord, fillColor);
                rhombhash[rhombcoord] = {
                    rhombus,
                    tri1: t,
                    tri2: t2
                };
            }
        }
    }
    const culledTris = [];
    for(i = disind.length - 1; i >= 0; i--) {
        culledTris.push(triangles[disind[i]]);
        triangles.splice(disind[i], 1);
    }
    for(const [rhombcoord, {tri1, tri2, rhombus}] of Object.entries(rhombhash)) {
        const neighbors = [];
        var j = 0;
        // X1, X2, Y1, Y2 or C1, C2, D1, D2
        for(const tri of [tri1, tri2])
            for(const side of [1, 2]) {
                var nei = tatham_neighbor_or_null(tri.coord, side);
                const rhombnei = nei && tri2rhomb[nei] || null;
                neighbors.push(rhombnei);
            }
        rhombhash[rhombcoord].neighbors = neighbors;
    }
    const culledRhombs = [];
    if(resolveRagged === "cull") {
        var cullRhombs;
        do {
            cullRhombs = Object.values(rhombhash)
                .filter(({neighbors}) => neighbors.filter(n => n).length < 2);
            for(const {rhombus, neighbors} of cullRhombs) {
                culledRhombs.push(rhombus);
                for(nei of neighbors) {
                    if(!nei)
                        continue;
                    const entry = rhombhash[nei];
                    for(const i of range(4))
                        if(entry.neighbors[i] === rhombus.coord)
                            entry.neighbors[i] = null;
                }
                delete rhombhash[rhombus.coord];
            }
        }
        while(cullRhombs.length);
    }
    discarded.concat(culledTris).forEach(tri => tri.fillColor = 'none');
    const elengths = [];
    for(const {rhombus: rh} of Object.values(rhombhash))
        for(const [v1, v2] of [[rh.v1,rh.v2], [rh.v2,rh.v3], [rh.v3, rh.v4], [rh.v4, rh.v1]])
            elengths.push(Math.hypot(v2.x - v1.x, v2.y - v1.y));
    const meanEdgeLength = mean(elengths);
    const {tl, br} = calculateRhombusesBB(Object.values(rhombhash).map(({rhombus}) => rhombus));
    const scale = scaleVector(tl, 1/meanEdgeLength);
    for(const rhombus of Object.values(rhombhash)) {
        const {rhombus: rh, tri1, tri2} = rhombus;
        rh.v1 = scale(rh.v1);
        rh.v2 = scale(rh.v2);
        rh.v3 = scale(rh.v3);
        rh.v4 = scale(rh.v4);

        rhombus.tri1scale = new Triangle(
            scale(tri1.v1),
            scale(tri1.v2),
            scale(tri1.v3),
            tri1.coord
        );

        rhombus.tri2scale = new Triangle(
            scale(tri2.v1),
            scale(tri2.v2),
            scale(tri2.v3),
            tri2.coord
        );
    }
    const rray = [];
    for(const {rhombus: rh} of Object.values(rhombhash)) {
        const cx = (rh.v1.x + rh.v3.x) / 2,
              cy = (rh.v1.y + rh.v3.y) / 2,
              cx2 = (rh.v2.x + rh.v4.x) / 2,
              cy2 = (rh.v2.y + rh.v4.y) / 2;
        console.assert(Math.abs(cx - cx2) < 1); // this seems incredibly loose if the rhombs are already scaled
        console.assert(Math.abs(cy - cy2) < 1);
        rhombhash[rh.coord].center = new Vector(cx, cy);
        var vs = [
            new Vector(rh.v1.x - cx, rh.v1.y - cy),
            new Vector(rh.v2.x - cx, rh.v2.y - cy),
            new Vector(rh.v3.x - cx, rh.v3.y - cy),
            new Vector(rh.v4.x - cx, rh.v4.y - cy)];
        rhombhash[rh.coord].key = rhomb_key(vs);
    }

    const key_to_base = {};
    const base_to_key = [];
    for(const [i, rh] of base_rhombuses.entries()) {
        const key = rhomb_key(rh);
        key_to_base[key] = i;
        base_to_key.push(key);
    }
    const not_found = new Set(),
          bases_found = new Set();
    for(const rhombdef of Object.values(rhombhash)) {
        const base = key_to_base[rhombdef.key];
        if(base !== undefined) {
            bases_found.add(base);
            rhombdef.base = base;
        }
        else {
            not_found.add(rhombdef.key);
            rhombdef.base = null;
        }
    }
    for(const nf of not_found)
        console.log('not found', nf);
    for(const base of range(10))
        if(!bases_found.has(base))
            console.log('unused', base, base_to_key[base]);
    
    return {
        center, r,
        polygon,
        robinsonTriangles: triangles,
        discardedTriangles: discarded,
        culledTriangles: culledTris,
        p3Rhombuses: rhombhash,
        culledRhombuses: culledRhombs,
        fillsIdentified: find_tris,
        fillsFound: found_tris,
        rhombBases: range(10),
        scaleFunction: scale
    };
}
