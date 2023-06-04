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

    print() {
	const prec = 4;
	return `${this.x.toFixed(prec)}, ${this.y.toFixed(prec)}`;
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
	if(!coord)
	    debugger;
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

function regularPolygon(center, r, sides) {
    const thetas = d3.range(0.5, sides, 1).map(v => v * 2 * Math.PI / sides);
    return thetas.map(theta => new Vector(Math.cos(theta)*r + center.x, Math.sin(theta)*r + center.y));
}

function triangulate(polygon) {
    return d3.range(2, polygon.length).map(i => new Triangle(polygon[0], polygon[i-1], polygon[i], "N/A", "green"));
}

const fixed = x => x.toFixed(3);

const poly_names = {square: 4, pentagon: 5, hexagon: 6};

function drawPenroseTiling() {
    var rounds = document.getElementById("level").value;
    var init_shape = document.querySelector('input[name="init_shape"]:checked').value;
    const width = +d3.select('svg#main').attr('width').replace('px', ''),
	  height =  +d3.select('svg#main').attr('height').replace('px', '');
    var ratio = Math.sin(36 * (Math.PI / 180)) / Math.sin(54 * (Math.PI / 180));
    var gnomon = new ThickRightTriangle(new Vector(width / 2.0, 0), new Vector(width, width / 2.0 * ratio), new Vector(0, width / 2.0 * ratio), 'D');
    var triangles = [gnomon];
    let center,
	r = d3.randomUniform(width/100, width/8)(),
	xrand = d3.randomUniform(r, width-r),
	yrand = d3.randomUniform(r, width / 2.0 * ratio - r),
	polygon, polyTris;
    do {
	center = new Vector(xrand(), yrand());
	polygon = regularPolygon(center, r, poly_names[init_shape]);
	polyTris = triangulate(polygon);
    } while(!polyTris.some(tri => trianglesIntersect(tri, gnomon)));

    for (var round = 0; round < rounds; round++) {
        var new_triangles = [];
	

        for (var i = 0; i < triangles.length; i++) {
            var trig = triangles[i];
            new_triangles = new_triangles.concat(trig.split());
        }

        triangles = new_triangles;
    }
    d3.select('svg#main')
	.selectAll('path.robinson').data(triangles)
	.join('path')
	.attr('class', 'robinson')
	.attr('d', tri => `M ${tri.v1.x}, ${tri.v1.y} L ${tri.v2.x}, ${tri.v2.y} L ${tri.v3.x}, ${tri.v3.y} Z`)
	.attr('fill', tri => tri.fillColor);
    if(showIndex) {
	d3.select('svg#main')
	    .selectAll('text.robinson').data(triangles)
	    .join('text')
	    .attr('class', 'text')
	    .attr('x', tri => (tri.v1.x + tri.v2.x + tri.v3.x) / 3)
	    .attr('y', tri => (tri.v1.y + tri.v2.y + tri.v3.y) / 3)
	    .text(tri => tri.coord);
    }
    d3.select('svg#main')
	.selectAll('path.polygon').data([0])
	.join('path')
	.attr('class', 'polygon')
	.attr('d', _ => `M ${polygon[0].print()} ` + polygon.slice(1).map(v => v.print()).join(' ') + ' Z');
	
}


const urlParams = new URLSearchParams(window.location.search);
const depth = urlParams.get('depth');
const shape = urlParams.get('shape');
const showIndex = urlParams.get('coord') !== null;

if(depth !== null) {
    d3.select('#level').property('value', depth);
    d3.select('#levelOutput').text(depth);
}

allowedShapes = d3.selectAll('input[name="init_shape"]').nodes().map(elem => elem.value);
if(shape !== null && allowedShapes.includes(shape))
    d3.selectAll('input[name="init_shape"]').property('checked', function() { return this.value === shape; });

