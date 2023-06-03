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

    multiply(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }

    add(anotherVector) {
        return new Vector(this.x + anotherVector.x, this.y + anotherVector.y);
    }
}

class Triangle {
    constructor(v1, v2, v3, fillColor) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;

        this.fillColor = fillColor;
    }

    // draw(ctx) {
    //     // Store fill style in a temp variable, to set it back later
    //     var tempFillStyle = ctx.fillStyle;

    //     ctx.fillStyle = this.fillColor;
    //     ctx.beginPath();
    //     ctx.moveTo(this.v1.x, this.v1.y);
    //     ctx.lineTo(this.v2.x, this.v2.y);
    //     ctx.lineTo(this.v3.x, this.v3.y);
    //     ctx.lineTo(this.v1.x, this.v1.y);
    //     ctx.fill();

    //     ctx.strokeStyle = "black";
    //     ctx.lineWidth = 3;
    //     ctx.beginPath();
    //     ctx.moveTo(this.v1.x, this.v1.y);
    //     ctx.lineTo(this.v2.x, this.v2.y);
    //     ctx.stroke();
    //     ctx.moveTo(this.v1.x, this.v1.y);
    //     ctx.lineTo(this.v3.x, this.v3.y);
    //     ctx.stroke();

    //     ctx.fillStyle = tempFillStyle;
    // }
}

class ThinLeftTriangle extends Triangle {
    constructor(v1, v2, v3) {
        super(v1, v2, v3, 'blue');
    }

    split() {
        var vector_13 = Vector.fromPoints(this.v1, this.v3).multiply(GOLDEN_RATIO);
        var split_point_13 = this.v1.add(vector_13);

        var new_triangles = []
        new_triangles.push(new ThinLeftTriangle(this.v2, this.v3, split_point_13));
        new_triangles.push(new ThickLeftTriangle(split_point_13, this.v1, this.v2));

        return new_triangles;
    }
}

class ThinRightTriangle extends Triangle {
    constructor(v1, v2, v3) {
        super(v1, v2, v3, 'blue');
    }

    split() {
        var vector_12 = Vector.fromPoints(this.v1, this.v2).multiply(GOLDEN_RATIO);
        var split_point_12 = this.v1.add(vector_12);

        var new_triangles = []
        new_triangles.push(new ThinRightTriangle(this.v3, split_point_12, this.v2));
        new_triangles.push(new ThickRightTriangle(split_point_12, this.v3, this.v1));

        return new_triangles;
    }
}

class ThickLeftTriangle extends Triangle {
    constructor(v1, v2, v3) {
        super(v1, v2, v3, 'red');
    }

    split() {
        var vector_32 = Vector.fromPoints(this.v3, this.v2).multiply(GOLDEN_RATIO);
        var split_point_32 = this.v3.add(vector_32);

        var vector_31 = Vector.fromPoints(this.v3, this.v1).multiply(GOLDEN_RATIO);
        var split_point_31 = this.v3.add(vector_31);

        var new_triangles = [];
        new_triangles.push(new ThickRightTriangle(split_point_31, split_point_32, this.v3));
        new_triangles.push(new ThinRightTriangle(split_point_32, split_point_31, this.v1));
        new_triangles.push(new ThickLeftTriangle(split_point_32, this.v1, this.v2));

        return new_triangles;
    }
}

class ThickRightTriangle extends Triangle {
    constructor(v1, v2, v3) {
        super(v1, v2, v3, 'red');
    }

    split() {
        var vector_21 = Vector.fromPoints(this.v2, this.v1).multiply(GOLDEN_RATIO);
        var split_point_21 = this.v2.add(vector_21);

        var vector_23 = Vector.fromPoints(this.v2, this.v3).multiply(GOLDEN_RATIO);
        var split_point_23 = this.v2.add(vector_23);

        var new_triangles = [];
        new_triangles.push(new ThickRightTriangle(split_point_23, this.v3, this.v1));
        new_triangles.push(new ThinLeftTriangle(split_point_23, this.v1, split_point_21));
        new_triangles.push(new ThickLeftTriangle(split_point_21, this.v2, split_point_23));

        return new_triangles;
    }
}

function drawPenroseTiling() {
    var rounds = document.getElementById("level").value;
    var init_shape = document.querySelector('input[name="init_shape"]:checked').value;
    const width = +d3.select('svg#main').attr('width').replace('px', ''),
	  height =  +d3.select('svg#main').attr('height').replace('px', '');
    var triangles = [];

    if (init_shape === 'rhombus') {
        var side = Math.min(width, height);
        var ratio = Math.sin(36 * (Math.PI / 180)) / Math.sin(54 * (Math.PI / 180));
        var t1 = new ThickRightTriangle(new Vector(side / 2.0, 0), new Vector(side, side / 2.0 * ratio), new Vector(0, side / 2.0 * ratio));
        var t2 = new ThickLeftTriangle(new Vector(side / 2.0, side * ratio), new Vector(0, side / 2.0 * ratio), new Vector(side, side / 2.0 * ratio));
        triangles.push(t1);
        triangles.push(t2);
    }

    if (init_shape === 'circle') {
        var side = Math.min(width, height);
        var r = side / 2.0;
        var grad_increment = 36 * (Math.PI / 180);
        var center = new Vector(side / 2.0, side / 2.0);
        for (var i = 0; i < 10; i++) {
            var v1 = center.add(new Vector(Math.cos(grad_increment * i), Math.sin(grad_increment * i)).multiply(r));
            var v2 = center.add(new Vector(Math.cos(grad_increment * (i+1)), Math.sin(grad_increment * (i+1))).multiply(r));
            var trig_class;
            if (i % 2 == 0) {
                trig_class = ThinRightTriangle;
            } else {
                trig_class = ThinLeftTriangle;
            }

            var trig = new trig_class(center, v2, v1);
            triangles.push(trig);
        }
    }

    for (var round = 0; round < rounds; round++) {
        var new_triangles = [];
	

        for (var i = 0; i < triangles.length; i++) {
            var trig = triangles[i];
            new_triangles = new_triangles.concat(trig.split());
        }

        triangles = new_triangles;
    }
    console.log(triangles);
    d3.select('svg#main')
	.selectAll('path').data(triangles)
	.join('path')
	.attr('d', tri => `M ${tri.v1.x}, ${tri.v1.y} L ${tri.v2.x}, ${tri.v2.y} L ${tri.v3.x}, ${tri.v3.y} Z`)
	.attr('fill', tri => tri.fillColor);
}


const urlParams = new URLSearchParams(window.location.search);
const depth = urlParams.get('depth');
const shape = urlParams.get('shape');

if(depth !== null) {
    d3.select('#level').property('value', depth);
    d3.select('#levelOutput').text(depth);
}

allowedShapes = d3.selectAll('input[name="init_shape"]').nodes().map(elem => elem.value);
if(shape !== null && allowedShapes.includes(shape))
    d3.selectAll('input[name="init_shape"]').property('checked', function() { return this.value === shape; });

