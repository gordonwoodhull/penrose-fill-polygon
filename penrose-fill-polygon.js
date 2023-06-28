var GOLDEN_RATIO = 0.6180339887498948482;


// from Eyal's answer, based on Hassan's, on Stack Overflow
// Detection of Triangle Collision in 2D Space
// https://stackoverflow.com/a/44269990


// check that all points of the other triangle are on the same side of the triangle after mapping to barycentric coordinates.
// returns true if all points are outside on the same side
var cross2 = function(A, B) {
    var a1 = A.v1;
    var a2 = A.v2;
    var a3 = A.v3;
    var b1 = B.v1;
    var b2 = B.v2;
    var b3 = B.v3;
    // renamed variable names above, inconsistent with below
    var dXa = a1.x - b3.x;
    var dYa = a1.y - b3.y;
    var dXb = a2.x - b3.x;
    var dYb = a2.y - b3.y;
    var dXc = a3.x - b3.x;
    var dYc = a3.y - b3.y;
    var dX21 = b3.x - b2.x;
    var dY12 = b2.y - b3.y;
    var D = dY12 * (b1.x - b3.x) + dX21 * (b1.y - b3.y);
    var sa = dY12 * dXa + dX21 * dYa;
    var sb = dY12 * dXb + dX21 * dYb;
    var sc = dY12 * dXc + dX21 * dYc;
    var ta = (b3.y - b1.y) * dXa + (b1.x - b3.x) * dYa;
    var tb = (b3.y - b1.y) * dXb + (b1.x - b3.x) * dYb;
    var tc = (b3.y - b1.y) * dXc + (b1.x - b3.x) * dYc;
    if (D < 0) return ((sa >= 0 && sb >= 0 && sc >= 0) ||
                       (ta >= 0 && tb >= 0 && tc >= 0) ||
                       (sa+ta <= D && sb+tb <= D && sc+tc <= D));
    return ((sa <= 0 && sb <= 0 && sc <= 0) ||
            (ta <= 0 && tb <= 0 && tc <= 0) ||
            (sa+ta >= D && sb+tb >= D && sc+tc >= D));
}

var trianglesIntersect = function(A, B) {
    return !(cross2(A, B) ||
             cross2(B, A));
}

// Used to represent both points and vectors for simplicity
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromPoints(start, end) {
        return new Vector(end.x - start.x, end.y - start.y);
    }

    print(xform, yform) {
	xform = xform || (x => x);
	yform = yform || (y => y);
	const prec = 4;
	return `${xform(this.x).toFixed(prec)}, ${yform(this.y).toFixed(prec)}`;
    }

    multiply(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }

    add(anotherVector) {
        return new Vector(this.x + anotherVector.x, this.y + anotherVector.y);
    }
}

class Triangle {
    constructor(v1, v2, v3, coord, fillColor) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;

        this.fillColor = fillColor;
	this.coord = coord;
    }
}

// C
class TriangleC extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    split() {
        var vector_12 = Vector.fromPoints(this.v1, this.v2).multiply(GOLDEN_RATIO);
        var split_point_12 = this.v1.add(vector_12);

        var new_triangles = [];
        new_triangles.push(new TriangleC(this.v3, split_point_12, this.v2, 'C' + this.coord));
        new_triangles.push(new TriangleY(split_point_12, this.v3, this.v1, 'Y' + this.coord));

        return new_triangles;
    }
}

// D
class TriangleD extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    split() {
        var vector_13 = Vector.fromPoints(this.v1, this.v3).multiply(GOLDEN_RATIO);
        var split_point_13 = this.v1.add(vector_13);

        var new_triangles = [];
        new_triangles.push(new TriangleD(this.v2, this.v3, split_point_13, 'D' + this.coord));
        new_triangles.push(new TriangleX(split_point_13, this.v1, this.v2, 'X' + this.coord));

        return new_triangles;
    }
}

// X
class TriangleX extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    split() {
        var vector_32 = Vector.fromPoints(this.v3, this.v2).multiply(GOLDEN_RATIO);
        var split_point_32 = this.v3.add(vector_32);

        var vector_31 = Vector.fromPoints(this.v3, this.v1).multiply(GOLDEN_RATIO);
        var split_point_31 = this.v3.add(vector_31);

        var new_triangles = [];
        new_triangles.push(new TriangleY(split_point_31, split_point_32, this.v3, 'Y' + this.coord));
        new_triangles.push(new TriangleC(split_point_32, split_point_31, this.v1, 'C' + this.coord));
        new_triangles.push(new TriangleX(split_point_32, this.v1, this.v2, 'X' + this.coord));

        return new_triangles;
    }
}

// Y
class TriangleY extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    split() {
        var vector_21 = Vector.fromPoints(this.v2, this.v1).multiply(GOLDEN_RATIO);
        var split_point_21 = this.v2.add(vector_21);

        var vector_23 = Vector.fromPoints(this.v2, this.v3).multiply(GOLDEN_RATIO);
        var split_point_23 = this.v2.add(vector_23);

        var new_triangles = [];
        new_triangles.push(new TriangleY(split_point_23, this.v3, this.v1, 'Y' + this.coord));
        new_triangles.push(new TriangleD(split_point_23, this.v1, split_point_21, 'D' + this.coord));
        new_triangles.push(new TriangleX(split_point_21, this.v2, split_point_23, 'X' + this.coord));

        return new_triangles;
    }
}

class Rhombus {
    constructor(v1, v2, v3, v4, coord, fillColor) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
	this.v4 = v4;

        this.fillColor = fillColor;
	this.coord = coord;
    }
}

const rtri_neighbors = {
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
};

const other_hand = {
    l: 'r',
    r: 'l'
};

const rtri_entries = {
    C: {
	0: {w: {part: 'C', side: 2}},
	1: {l: {part: 'Y', side: 2},
	    r: {part: 'C', side: 0}},
	2: {w: {part: 'Y', side: 0}}
    },
    D: {
	0: {w: {part: 'D', side: 1}},
	1: {w: {part: 'X', side: 0}},
	2: {l: {part: 'D', side: 0},
	    r: {part: 'X', side: 1}}
    },
    X: {
	0: {l: {part: 'X', side: 2},
	    r: {part: 'Y', side: 0}},
	1: {w: {part: 'X', side: 0}},
	2: {l: {part: 'Y', side: 2},
	    r: {part: 'C', side: 0}}
    },
    Y: {
	0: {l: {part: 'X', side: 0},
	    r: {part: 'Y', side: 1}},
	1: {l: {part: 'D', side: 0},
	    r: {part: 'X', side: 1}},
	2: {w: {part: 'Y', side: 0}}
    }
}

function tatham_neighbor(coord, side) {
    if(coord.length < 2)
	throw new Error("no neighbor");
    const pre2 = coord.slice(0, 2);
    const neighbors = rtri_neighbors[pre2];
    console.assert(neighbors, 'unknown prefix', pre2);
    const nei = neighbors[side];
    var result;
    if(nei.external) {
	console.assert(nei.side !== undefined);
	const [parent, pside] = tatham_neighbor(coord.slice(1), nei.side);
	const enter = rtri_entries[parent[0]][pside];
	let part, side;
	if(nei.hand) {
	    console.assert(enter.l);
	    ({part, side} = enter[other_hand[nei.hand]]);
	} else {
	    console.assert(enter.w);
	    ({part, side} = enter.w);
	}
	return [part + parent, side];
    }
    else {
	return [nei.prefix + coord.slice(1), nei.enter];
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
	sides: 6
    }
};

function regularPolygon(center, r, shape) {
    const {sides, offset} = shape_spec[shape];
    const thetas = d3.range(offset || 0, sides, 1).map(v => v * 2 * Math.PI / sides);
    return thetas.map(theta => new Vector(Math.cos(theta)*r + center.x, Math.sin(theta)*r + center.y));
}

function triangulate(polygon) {
    return d3.range(2, polygon.length).map(i => new Triangle(polygon[0], polygon[i-1], polygon[i], "N/A", "green"));
}

function generateTriangles(triangles, filt, enough) {
    const discarded = [];
    do {
        var new_triangles = [];
        for (var i = 0; i < triangles.length; i++) {
            var trig = triangles[i];
            new_triangles = new_triangles.concat(trig.split());
        }
        triangles = new_triangles.filter(tri => {
	    if(filt(tri))
		return true;
	    discarded.push(tri);
	    return false;
	});
    }
    while(!enough(triangles));
    return [triangles, discarded];
}

function lighten(color) {
    switch(color) {
    case 'blue':
        return 'lightblue';
    case 'red':
        return 'pink';
    }
    console.log('unknown color to lighten', color);
    return color;
}

function calculatePenroseTiling(minTiles, width, height, boundsShape, startTile, resolveRagged) {
    var ratio = Math.sin(36 * (Math.PI / 180)) / Math.sin(54 * (Math.PI / 180));
    var startri = null;
    switch(startTile) {
    case 'C':
	startri = new TriangleC(new Vector(width / 2 - height / 2 / ratio, height / 2), new Vector(width / 2 + height / 2 / ratio, 0), new Vector(width / 2 + height / 2 / ratio, height), startTile);
	break;
    case 'D':
	startri = new TriangleD(new Vector(width / 2 - height / 2 / ratio, height / 2), new Vector(width / 2 + height / 2 / ratio, 0), new Vector(width / 2 + height / 2 / ratio, height), startTile);
	break;
    case 'X':
	startri = new TriangleX(new Vector(width / 2.0, 0), new Vector(width, width / 2.0 * ratio), new Vector(0, width / 2.0 * ratio), startTile);
	break;
    case 'Y':
	startri = new TriangleY(new Vector(width / 2.0, 0), new Vector(width, width / 2.0 * ratio), new Vector(0, width / 2.0 * ratio), startTile);
	break;
    }
    var triangles = [startri];
    let center,
	r = d3.randomUniform(width/1000, width/8)(),
	xrand = d3.randomUniform(r, width-r),
	yrand = d3.randomUniform(r, width / 2.0 * ratio - r),
	polygon, tinytris;
    do {
	center = new Vector(xrand(), yrand());
	polygon = regularPolygon(center, r, boundsShape);
	// this is dumb; we want point in polygon but we have the hammer of triangle intersection
	// it's not like we need to speed this up
	tinytris = polygon.map(p => new Triangle(p, new Vector(p.x + 0.0001, p.y + 0.0001), new Vector(p.x - 0.0002, p.y)));
    } while(!tinytris.every(tri => trianglesIntersect(tri, startri)));

    const polyTris = triangulate(polygon);

    console.assert(!isNaN(minTiles));
    var discarded;
    [triangles, discarded] = generateTriangles(
	triangles,
	tri => polyTris.some(ptri => trianglesIntersect(ptri, tri)),
	tris => tris.length / 2 > minTiles);

    const trihash = {};
    for(var t of triangles)
	trihash[t.coord] = t;
    const disind = [];
    const find_tris = [];
    for(var [i, t] of triangles.entries()) {
	var oh = null;
	try {
	    oh = tatham_neighbor(t.coord, 0)[0];
	}
	catch(xep) {
	    console.warn('no neighbor', 0, 'for', t.coord);
	}
	var t2;
	if(!oh || !(t2 = trihash[oh])) {
	    if(resolveRagged === "cull")
		disind.push(i);
	    else if(resolveRagged === "fill") {
		var nei1 = null, nei2 = null, last;
		try {
		    nei1 = tatham_neighbor(t.coord, last = 1)[0];
		    nei2 = tatham_neighbor(t.coord, last = 2)[0];
		}
		catch(xep) {
		    console.warn('no neighbor', last, 'for', t.coord);
		}
		if(oh && nei1 && nei2)
		    find_tris.push(oh);
		else
		    disind.push(i);
	    }
	}
    }
    var found_tris = [];
    if(find_tris.length) {
	[found_tris] = generateTriangles(
	    [startri],
	    tri => find_tris.some(find => find.indexOf(tri.coord) === find.length - tri.coord.length),
	    tris => !tris.length || tris[0].coord.length === find_tris[0].length);
        console.log(find_tris);
        console.log(found_tris.map(({coord}) => coord));
	for(const tri of found_tris)
	    trihash[tri.coord] = tri;
	triangles.push(...found_tris);
    }
    const rhombhash = {};
    const tri2rhomb = {};
    for(var [i, t] of triangles.entries()) {
	var oh = null;
	try {
	    oh = tatham_neighbor(t.coord, 0)[0];
	}
	catch(xep) {
	    console.warn('no neighbor', 0, 'for', t.coord);
	}
	var t2;
	if(oh && (t2 = trihash[oh])) {
	    const rhombcoord = [t.coord, oh].sort().join(',');
	    if(rhombhash[rhombcoord])
		continue;
	    else {
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
		var nei = null;
		try {
		    [nei,_] = tatham_neighbor(tri.coord, side);
		}
		catch(xep) {
		    console.warn('no neighbor', side, 'for', tri.coord);
		}
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
		    for(const i of d3.range(4)) {
			if(entry.neighbors[i] === rhombus.coord)
			    entry.neighbors[i] = null;
		    }
		}
		delete rhombhash[rhombus.coord];
	    }
	}
	while(cullRhombs.length);
    }
    discarded.concat(culledTris).forEach(tri => tri.fillColor = 'none');
    return {
        center, r,
        polygon,
        robinsonTriangles: triangles,
        discardedTriangles: discarded,
        culledTriangles: culledTris,
        p3Rhombuses: rhombhash,
        culledRhombuses: culledRhombs,
        fillsIdentified: find_tris,
        fillsFound: found_tris
    };
}
