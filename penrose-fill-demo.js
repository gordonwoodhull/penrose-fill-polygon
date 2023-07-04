function highlightTriNeighbors(selector, coord) {
    const neighbors = d3.range(3).map(i => {
	return tatham_neighbor_or_null(coord, i);
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
    const neighbors = coord ? rhombhash[coord].neighbors : [null, null, null, null];
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
	.on('mouseover', (_, d) => highlightRhombNeighbors(selector, rhombhash, d.coord))
        .on('mouseout', () => highlightRhombNeighbors(selector, rhombhash, null));
    if(showIndex) {
	d3.select(`${selector} g#rhombuses`)
	    .selectAll('text.robinson').data(rhombuses)
	    .join('text')
	    .attr('class', 'robinson')
	    .attr('x', rhomb => xform((rhomb.v1.x + rhomb.v2.x + rhomb.v3.x + rhomb.v4.x) / 4))
	    .attr('y', rhomb => yform((rhomb.v1.y + rhomb.v2.y + rhomb.v3.y + rhomb.v4.y) / 4))
	    .text(rhomb => rhomb.coord)
	    .on('mouseover', (_, d) => highlightRhombNeighbors(selector, rhombhash, d.coord))
            .on('mouseout', () => highlightRhombNeighbors(selector, rhombhash, null));
    }
    d3.select(`${selector} g#polygon`)
	.selectAll('path.polygon').data([0])
	.join('path')
	.attr('class', 'polygon')
	.attr('d', _ => `M ${polygon[0].print(xform, yform)} ` + polygon.slice(1).map(v => v.print(xform, yform)).join(' ') + ' Z');
}

function fixPolygon(center, r) {
    urlParams.set('center', center.print());
    urlParams.set('r', r.toFixed(4));
    window.location.search = urlParams;
}

function unfixPolygon() {
    urlParams.delete('center');
    urlParams.delete('r');
    window.location.search = urlParams;
}

function drawPenroseTiling() {
    var minTiles = document.getElementById("minimum").value;
    var boundsShape = document.querySelector('input[name="init_shape"]:checked').value;
    var resolve_ragged = document.querySelector('input[name="resolve_ragged"]:checked').value;
    const width = +d3.select('svg#gnomon').nodes()[0].clientWidth,
	  height =  +d3.select('svg#gnomon').nodes()[0].clientHeight;
    let fixedCenter = null, fixedR = null;
    if(urlCenter) {
        fixedCenter = urlCenter.split(',').map(x => +x);
        if(fixedCenter.length != 2 || isNaN(fixedCenter[0]) || isNaN(fixedCenter[1]))
            fixedCenter = null;
        else fixedCenter = new Vector(...fixedCenter);
    }
    if(urlR)
        fixedR = +urlR || null;
    const startt = performance.now();
    const {
        center, r, polygon,
        robinsonTriangles, discardedTriangles, culledTriangles,
        p3Rhombuses, culledRhombuses, fillsIdentified, fillsFound
    } = calculatePenroseTiling(
        +minTiles, width, height, boundsShape, startile, resolve_ragged, fixedCenter, fixedR
    );
    const dt = performance.now() - startt;

    const fixLink = (!fixedCenter && !fixedR) ?
          '<a id="fix-polygon" href="#">fix</a></div>' :
          '<a id="unfix-polygon" href="#">unfix</a></div>';
    d3.select('#readout').html(
`<div>center: ${center.print()}</div>
<div>r: ${r.toFixed(4)} ${fixLink}
<div>triangles found: ${robinsonTriangles.length}</div>` +
	    (resolve_ragged === 'cull' ?
`<div>triangles culled: ${culledTriangles.length}</div>
<div>rhombs culled: ${culledRhombuses.length}</div>` :
	     resolve_ragged === 'fill' ?
`<div>fills identified: ${fillsIdentified.length}</div>
<div>fills found: ${fillsFound.length}</div>` :
	     '') +
            `<div><div>calculation time: ${dt.toFixed(1)}ms</div>`);
    window.setTimeout(() => {
        d3.select('#fix-polygon').on('click', () => fixPolygon(center, r));
        d3.select('#unfix-polygon').on('click', () => unfixPolygon());
    }, 250);
    drawTriangles('svg#gnomon', robinsonTriangles, discardedTriangles.concat(culledTriangles), polygon);
    // svg viewBox distorts things; we want to zoom in without making lines thicker
    // assume svg is wider than tall, and tiles are aspect ratio 1
    const tl = new Vector(
	d3.min(robinsonTriangles, tri => d3.min([tri.v1.x, tri.v2.x, tri.v3.x])),
	d3.min(robinsonTriangles, tri => d3.min([tri.v1.y, tri.v2.y, tri.v3.y])));
    const br = new Vector(
	d3.max(robinsonTriangles, tri => d3.max([tri.v1.x, tri.v2.x, tri.v3.x])),
	d3.max(robinsonTriangles, tri => d3.max([tri.v1.y, tri.v2.y, tri.v3.y])));
    const twidth = +d3.select('svg#tiles').nodes()[0].clientWidth,
	  theight =  +d3.select('svg#tiles').nodes()[0].clientHeight;
    const rwidth = br.x - tl.x, rheight = br.y - tl.y;
    const ofs = new Vector((twidth - theight)/2, 0);
    const scale = new Vector(theight/rheight, theight/rheight);
    if(drawlevel === 'triangle')
	drawTriangles('svg#tiles', robinsonTriangles, culledTriangles, polygon, tl, ofs, scale);
    else if(drawlevel === 'rhombus')
	drawRhombuses('svg#tiles', p3Rhombuses, polygon, tl, ofs, scale);
}

const urlParams = new URLSearchParams(window.location.search);
const depth = urlParams.get('depth');
const shape = urlParams.get('shape');
const ragged = urlParams.get('ragged');
const startile = urlParams.get('tile') || 'X';
const showIndex = urlParams.get('coord') !== null;
const drawlevel = urlParams.get('draw') || 'rhombus';
const urlCenter = urlParams.get('center') || null;
const urlR = urlParams.get('r') || null;

if(depth !== null) {
    d3.select('#minimum').property('value', depth);
    d3.select('#minimumOutput').text(depth);
}

const allowedShapes = d3.selectAll('input[name="init_shape"]').nodes().map(elem => elem.value);
if(shape !== null && allowedShapes.includes(shape))
    d3.selectAll('input[name="init_shape"]').property('checked', function() { return this.value === shape; });
const allowedRagged = d3.selectAll('input[name="resolve_ragged"]').nodes().map(elem => elem.value);
if(ragged !== null && allowedRagged.includes(ragged))
    d3.selectAll('input[name="resolve_ragged"]').property('checked', function() { return this.value === ragged; });

