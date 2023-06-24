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

const fixed = x => x.toFixed(3);

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

function highlightTriNeighbors(selector, coord) {
    const neighbors = d3.range(3).map(i => {
	var nei;
	try {
	    nei = tatham_neighbor(coord, i)[0];
        }
	catch(xep) {
	    console.warn('no neighbor for', coord);
	}
	return nei;
    });
    d3.selectAll(`${selector} g#triangles text.robinson`)
	.classed('over', d => d.coord === coord)
	.classed('side0', d => d.coord === neighbors[0])
	.classed('side1', d => d.coord === neighbors[1])
	.classed('side2', d => d.coord === neighbors[2]);
    d3.selectAll(`${selector} g#triangles path.robinson`)
	.classed('over', d => d.coord === coord)
	.classed('side0', d => d.coord === neighbors[0])
	.classed('side1', d => d.coord === neighbors[1])
	.classed('side2', d => d.coord === neighbors[2]);
}

function drawTriangles(selector, triangles, discarded, polygon, tl = null, ofs = null, scale = null) {
    tl = tl || new Vector(0, 0);
    ofs = ofs || new Vector(0, 0);
    scale = scale || new Vector(1, 1);
    const xform = x => (x - tl.x) * scale.x + ofs.x;
    const yform = y => (y - tl.y) * scale.y + ofs.y;
    d3.select(`${selector} g#triangles`)
	.selectAll('path.robinson').data(triangles.concat(discarded))
	.join('path')
	.attr('class', 'robinson')
	.attr('d', tri => `M ${xform(tri.v1.x)}, ${yform(tri.v1.y)} L ${xform(tri.v2.x)}, ${yform(tri.v2.y)} L ${xform(tri.v3.x)}, ${yform(tri.v3.y)} Z`)
	.style('fill', tri => tri.fillColor)
	.on('mouseover', (_, d) => highlightTriNeighbors(selector, d.coord));
    if(showIndex) {
	d3.select(`${selector} g#triangles`)
	    .selectAll('text.robinson').data(triangles.concat(discarded))
	    .join('text')
	    .attr('class', 'robinson')
	    .attr('x', tri => xform((tri.v1.x + tri.v2.x + tri.v3.x) / 3))
	    .attr('y', tri => yform((tri.v1.y + tri.v2.y + tri.v3.y) / 3))
	    .text(tri => tri.coord)
	    .on('mouseover', (_, d) => highlightTriNeighbors(selector, d.coord));
    }
    d3.select(`${selector} g#polygon`)
	.selectAll('path.polygon').data([0])
	.join('path')
	.attr('class', 'polygon')
	.attr('d', _ => `M ${polygon[0].print(xform, yform)} ` + polygon.slice(1).map(v => v.print(xform, yform)).join(' ') + ' Z');
}

function highlightRhombNeighbors(selector, rhombhash, coord) {
    const {neighbors} = rhombhash[coord];
    d3.selectAll(`${selector} g#rhombuses text.robinson`)
	.classed('over', d => d.coord === coord)
	.classed('side0', d => d.coord === neighbors[0])
	.classed('side1', d => d.coord === neighbors[1])
	.classed('side2', d => d.coord === neighbors[2])
	.classed('side3', d => d.coord === neighbors[3]);
    d3.selectAll(`${selector} g#rhombuses path.robinson`)
	.classed('over', d => d.coord === coord)
	.classed('side0', d => d.coord === neighbors[0])
	.classed('side1', d => d.coord === neighbors[1])
	.classed('side2', d => d.coord === neighbors[2])
	.classed('side3', d => d.coord === neighbors[3]);
}

function drawRhombuses(selector, rhombhash, polygon, tl = null, ofs = null, scale = null) {
    tl = tl || new Vector(0, 0);
    ofs = ofs || new Vector(0, 0);
    scale = scale || new Vector(1, 1);
    const xform = x => (x - tl.x) * scale.x + ofs.x;
    const yform = y => (y - tl.y) * scale.y + ofs.y;
    const rhombuses = Object.values(rhombhash).map(({rhombus}) => rhombus);
    d3.select(`${selector} g#rhombuses`)
	.selectAll('path.robinson').data(rhombuses)
	.join('path')
	.attr('class', 'robinson')
	.attr('d', rhomb => `M ${xform(rhomb.v1.x)}, ${yform(rhomb.v1.y)} L ${xform(rhomb.v2.x)}, ${yform(rhomb.v2.y)} L ${xform(rhomb.v3.x)}, ${yform(rhomb.v3.y)} L ${xform(rhomb.v4.x)}, ${yform(rhomb.v4.y)} Z`)
	.style('fill', rhomb => rhomb.fillColor)
	.on('mouseover', (_, d) => highlightRhombNeighbors(selector, rhombhash, d.coord));
    if(showIndex) {
	d3.select(`${selector} g#rhombuses`)
	    .selectAll('text.robinson').data(rhombuses)
	    .join('text')
	    .attr('class', 'robinson')
	    .attr('x', rhomb => xform((rhomb.v1.x + rhomb.v2.x + rhomb.v3.x + rhomb.v4.x) / 4))
	    .attr('y', rhomb => yform((rhomb.v1.y + rhomb.v2.y + rhomb.v3.y + rhomb.v4.y) / 4))
	    .text(rhomb => rhomb.coord)
	    .on('mouseover', (_, d) => highlightRhombNeighbors(selector, rhombhash, d.coord));
    }
    d3.select(`${selector} g#polygon`)
	.selectAll('path.polygon').data([0])
	.join('path')
	.attr('class', 'polygon')
	.attr('d', _ => `M ${polygon[0].print(xform, yform)} ` + polygon.slice(1).map(v => v.print(xform, yform)).join(' ') + ' Z');
}

function drawPenroseTiling() {
    var minimum = document.getElementById("minimum").value;
    var init_shape = document.querySelector('input[name="init_shape"]:checked').value;
    var resolve_ragged = document.querySelector('input[name="resolve_ragged"]:checked').value;
    const width = +d3.select('svg#gnomon').nodes()[0].clientWidth,
	  height =  +d3.select('svg#gnomon').nodes()[0].clientHeight;
    const startt = performance.now();
    var ratio = Math.sin(36 * (Math.PI / 180)) / Math.sin(54 * (Math.PI / 180));
    var startri = null;
    switch(startile) {
    case 'C':
	startri = new TriangleC(new Vector(width / 2 - height / 2 / ratio, height / 2), new Vector(width / 2 + height / 2 / ratio, 0), new Vector(width / 2 + height / 2 / ratio, height), startile);
	break;
    case 'D':
	startri = new TriangleD(new Vector(width / 2 - height / 2 / ratio, height / 2), new Vector(width / 2 + height / 2 / ratio, 0), new Vector(width / 2 + height / 2 / ratio, height), startile);
	break;
    case 'X':
	startri = new TriangleX(new Vector(width / 2.0, 0), new Vector(width, width / 2.0 * ratio), new Vector(0, width / 2.0 * ratio), startile);
	break;
    case 'Y':
	startri = new TriangleY(new Vector(width / 2.0, 0), new Vector(width, width / 2.0 * ratio), new Vector(0, width / 2.0 * ratio), startile);
	break;
    }
    var triangles = [startri];
    console.log(startri);
    let center,
	r = d3.randomUniform(width/1000, width/8)(),
	xrand = d3.randomUniform(r, width-r),
	yrand = d3.randomUniform(r, width / 2.0 * ratio - r),
	polygon, tinytris;
    do {
	center = new Vector(xrand(), yrand());
	polygon = regularPolygon(center, r, init_shape);
	// this is dumb; we want point in polygon but we have the hammer of triangle intersection
	// it's not like we need to speed this up
	tinytris = polygon.map(p => new Triangle(p, new Vector(p.x + 0.0001, p.y + 0.0001), new Vector(p.x - 0.0002, p.y)));
    } while(!tinytris.every(tri => trianglesIntersect(tri, startri)));

    const polyTris = triangulate(polygon);

    var discarded;
    [triangles, discarded] = generateTriangles(
	triangles,
	tri => polyTris.some(ptri => trianglesIntersect(ptri, tri)),
	tris => tris.length / 2 > minimum);

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
	    if(resolve_ragged === "cull")
		disind.push(i);
	    else if(resolve_ragged === "fill") {
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
	console.log(startri);
	[found_tris] = generateTriangles(
	    [startri], 
	    tri => find_tris.some(find => find.indexOf(tri.coord) === find.length - tri.coord.length),
	    tris => !tris.length || tris[0].coord.length === find_tris[0].length);
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
		const rhombus = new Rhombus(t.v1, t.v2, t2.v1, t2.v2, rhombcoord, t.fillColor);
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
    if(resolve_ragged === "cull") {
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
    
    const dt = performance.now() - startt;
    discarded.concat(culledTris).forEach(tri => tri.fillColor = 'none');
    d3.select('#readout').html(
`<div>center: ${center.print()}</div>
<div>r: ${r.toFixed(4)}</div>
<div>triangles found: ${triangles.length}</div>` +
	    (resolve_ragged === 'cull' ?
`<div>discarded indices: ${disind.length}</div>
<div>triangles culled: ${culledTris.length}</div>
<div>rhombs culled: ${culledRhombs.length}</div>` :
	     resolve_ragged === 'fill' ?
`<div>fills identified: ${find_tris.length}</div>
<div>fills found: ${found_tris.length}</div>` :
	     '') +
`<div><div>calculation time:${dt}ms</div>`);
    drawTriangles('svg#gnomon', triangles, discarded.concat(culledTris), polygon);
    // svg viewBox distorts things; we want to zoom in without making lines thicker
    // assume svg is wider than tall, and tiles are aspect ratio 1 
    const tl = new Vector(
	d3.min(triangles, tri => d3.min([tri.v1.x, tri.v2.x, tri.v3.x])),
	d3.min(triangles, tri => d3.min([tri.v1.y, tri.v2.y, tri.v3.y])));
    const br = new Vector(
	d3.max(triangles, tri => d3.max([tri.v1.x, tri.v2.x, tri.v3.x])),
	d3.max(triangles, tri => d3.max([tri.v1.y, tri.v2.y, tri.v3.y])));
    const twidth = +d3.select('svg#tiles').nodes()[0].clientWidth,
	  theight =  +d3.select('svg#tiles').nodes()[0].clientHeight;
    const rwidth = br.x - tl.x, rheight = br.y - tl.y;
    const ofs = new Vector((twidth - theight)/2, 0);
    const scale = new Vector(theight/rheight, theight/rheight);
    if(drawlevel === 'triangle')
	drawTriangles('svg#tiles', triangles, culledTris, polygon, tl, ofs, scale);
    else if(drawlevel === 'rhombus')
	drawRhombuses('svg#tiles', rhombhash, polygon, tl, ofs, scale);
}


const urlParams = new URLSearchParams(window.location.search);
const depth = urlParams.get('depth');
const shape = urlParams.get('shape');
const ragged = urlParams.get('ragged');
const startile = urlParams.get('tile') || 'X';
const showIndex = urlParams.get('coord') !== null;
const drawlevel = urlParams.get('draw') || 'rhombus';

if(depth !== null) {
    d3.select('#minimum').property('value', depth);
    d3.select('#minimumOutput').text(depth);
}

const allowedShapes = d3.selectAll('input[name="init_shape"]').nodes().map(elem => elem.value);
if(shape !== null && allowedShapes.includes(shape))
    d3.selectAll('input[name="init_shape"]').property('checked', function() { return this.value === shape; });
const allowedRagged = d3.selectAll('input[name="resolve_ragged"]').nodes().map(elem => elem.value);
if(ragged !== null && allowedRagged.includes(ragged)) {
    if(ragged === 'fill') {
	d3.select('#ragged-fill').style('display', null);
	d3.select('label[for=ragged-fill]').style('display', null);
    }
    d3.selectAll('input[name="resolve_ragged"]').property('checked', function() { return this.value === ragged; });
}
