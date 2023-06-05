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

// X
class ThinLeftTriangle extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    split() {
        var vector_13 = Vector.fromPoints(this.v1, this.v3).multiply(GOLDEN_RATIO);
        var split_point_13 = this.v1.add(vector_13);

        var new_triangles = []
        new_triangles.push(new ThinLeftTriangle(this.v2, this.v3, split_point_13, 'D' + this.coord));
        new_triangles.push(new ThickLeftTriangle(split_point_13, this.v1, this.v2, 'X' + this.coord));

        return new_triangles;
    }
}

// Y
class ThinRightTriangle extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'blue');
    }

    split() {
        var vector_12 = Vector.fromPoints(this.v1, this.v2).multiply(GOLDEN_RATIO);
        var split_point_12 = this.v1.add(vector_12);

        var new_triangles = []
        new_triangles.push(new ThinRightTriangle(this.v3, split_point_12, this.v2, 'Y' + this.coord));
        new_triangles.push(new ThickRightTriangle(split_point_12, this.v3, this.v1, 'C' + this.coord));

        return new_triangles;
    }
}

// C
class ThickLeftTriangle extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    split() {
        var vector_32 = Vector.fromPoints(this.v3, this.v2).multiply(GOLDEN_RATIO);
        var split_point_32 = this.v3.add(vector_32);

        var vector_31 = Vector.fromPoints(this.v3, this.v1).multiply(GOLDEN_RATIO);
        var split_point_31 = this.v3.add(vector_31);

        var new_triangles = [];
        new_triangles.push(new ThickRightTriangle(split_point_31, split_point_32, this.v3, 'X' + this.coord));
        new_triangles.push(new ThinRightTriangle(split_point_32, split_point_31, this.v1, 'D' + this.coord));
        new_triangles.push(new ThickLeftTriangle(split_point_32, this.v1, this.v2, 'C' + this.coord));

        return new_triangles;
    }
}

// D
class ThickRightTriangle extends Triangle {
    constructor(v1, v2, v3, coord) {
        super(v1, v2, v3, coord, 'red');
    }

    split() {
        var vector_21 = Vector.fromPoints(this.v2, this.v1).multiply(GOLDEN_RATIO);
        var split_point_21 = this.v2.add(vector_21);

        var vector_23 = Vector.fromPoints(this.v2, this.v3).multiply(GOLDEN_RATIO);
        var split_point_23 = this.v2.add(vector_23);

        var new_triangles = [];
        new_triangles.push(new ThickRightTriangle(split_point_23, this.v3, this.v1, 'Y' + this.coord));
        new_triangles.push(new ThinLeftTriangle(split_point_23, this.v1, split_point_21, 'C' + this.coord));
        new_triangles.push(new ThickLeftTriangle(split_point_21, this.v2, split_point_23, 'D' + this.coord));

        return new_triangles;
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

function draw(selector, triangles, discarded, polygon, tl = null, ofs = null, scale = null) {
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
	.attr('fill', tri => tri.fillColor);
    if(showIndex) {
	d3.select(`${selector} g#triangles`)
	    .selectAll('text.robinson').data(triangles)
	    .join('text')
	    .attr('class', 'robinson')
	    .attr('x', tri => xform((tri.v1.x + tri.v2.x + tri.v3.x) / 3))
	    .attr('y', tri => yform((tri.v1.y + tri.v2.y + tri.v3.y) / 3))
	    .text(tri => tri.coord);
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
    const width = +d3.select('svg#gnomon').nodes()[0].clientWidth,
	  height =  +d3.select('svg#gnomon').nodes()[0].clientHeight;
    const startt = performance.now();
    var ratio = Math.sin(36 * (Math.PI / 180)) / Math.sin(54 * (Math.PI / 180));
    var gnomon = new ThickRightTriangle(new Vector(width / 2.0, 0), new Vector(width, width / 2.0 * ratio), new Vector(0, width / 2.0 * ratio), 'D');
    var triangles = [gnomon];
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
    } while(!tinytris.every(tri => trianglesIntersect(tri, gnomon)));

    const polyTris = triangulate(polygon);

    const discarded = [];
    do {
        var new_triangles = [];
	

        for (var i = 0; i < triangles.length; i++) {
            var trig = triangles[i];
            new_triangles = new_triangles.concat(trig.split());
        }
	discarded.push.apply(discarded, new_triangles.filter(tri => !polyTris.some(ptri => trianglesIntersect(ptri, tri))));
        triangles = new_triangles.filter(tri => polyTris.some(ptri => trianglesIntersect(ptri, tri)));
    }
    while (triangles.length / 2 < minimum);
    const dt = performance.now() - startt;
    discarded.forEach(tri => tri.fillColor = 'none');
    d3.select('#readout').html(`<div>center: ${center.print()}</div><div>r: ${r.toFixed(4)}</div><div>calculation time:${dt}ms</div>`);
    draw('svg#gnomon', triangles, discarded, polygon);
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
    draw('svg#tiles', triangles, [], polygon, tl, ofs, scale);
}


const urlParams = new URLSearchParams(window.location.search);
const depth = urlParams.get('depth');
const shape = urlParams.get('shape');
const showIndex = urlParams.get('coord') !== null;

if(depth !== null) {
    d3.select('#minimum').property('value', depth);
    d3.select('#minimumOutput').text(depth);
}

allowedShapes = d3.selectAll('input[name="init_shape"]').nodes().map(elem => elem.value);
if(shape !== null && allowedShapes.includes(shape))
    d3.selectAll('input[name="init_shape"]').property('checked', function() { return this.value === shape; });

