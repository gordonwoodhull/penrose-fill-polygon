var {Vector, average_vectors, interpolate_vectors, calculatePenroseTiling, tatham_neighbor_or_null, calculateTrianglesBB, calculateRhombusesBB} = penroseFillPolygon;

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
        const maxCoordLen = 9;
        d3.select(`${selector} g#triangles`)
            .selectAll('text.robinson').data(triangles.concat(discarded))
            .join('text')
            .attr('class', 'robinson')
            .attr('x', tri => xform((tri.v1.x + tri.v2.x + tri.v3.x) / 3))
            .attr('y', tri => yform((tri.v1.y + tri.v2.y + tri.v3.y) / 3))
            .style('opacity', ({coord}) => d3.easeCubicOut((maxCoordLen - coord.length)/maxCoordLen))
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
    const categorical_colors = d3.schemeTableau10.concat(d3.schemeSet3);
    d3.select(`${selector} g#rhombuses`)
        .selectAll('path.robinson').data(rhombuses)
        .join('path')
        .attr('class', 'robinson')
        .attr('d', rhomb => `M ${xform(rhomb.v1.x)}, ${yform(rhomb.v1.y)} L ${xform(rhomb.v2.x)}, ${yform(rhomb.v2.y)} L ${xform(rhomb.v3.x)}, ${yform(rhomb.v3.y)} L ${xform(rhomb.v4.x)}, ${yform(rhomb.v4.y)} Z`)
        .style('fill', rhomb => showBaseRhombuses ? categorical_colors[rhombhash[rhomb.coord].base] : rhomb.fillColor)
        .on('mouseover', (_, d) => highlightRhombNeighbors(selector, rhombhash, d.coord))
        .on('mouseout', () => highlightRhombNeighbors(selector, rhombhash, null));
    if(showBaseRhombuses) {
        d3.select(`${selector} g#rhombuses`)
            .selectAll('text.robinson').data(rhombuses)
            .join('text')
            .attr('class', 'robinson')
            .attr('x', rhomb => xform((rhomb.v1.x + rhomb.v2.x + rhomb.v3.x + rhomb.v4.x) / 4))
            .attr('y', rhomb => yform((rhomb.v1.y + rhomb.v2.y + rhomb.v3.y + rhomb.v4.y) / 4))
            .text(rhomb => showIndex ? rhomb.coord.split(',').map(s => s.slice(0, showIndex)).join(',') : rhombhash[rhomb.coord].base)    
    }
    if(showIndex || showSides) {
        const calc_center = tri => average_vectors((tri.v1.x + tri.v2.x + tri.v3.x) / 3)
        const triangles = Object.values(rhombhash).flatMap(({tri1scale, tri2scale}) => [
            {
                tri: tri1scale,
                center: tri1scale.center()
            },
            {
                tri: tri2scale,
                center: tri2scale.center()
            }
        ]);
        if(showIndex) {
            d3.select(`${selector} g#tricoord`)
            .selectAll('text.robinson').data(triangles)
            .join('text')
            .attr('class', 'robinson')
            .attr('x', ({center}) => xform(center.x))
            .attr('y', ({center}) => yform(center.y))
            .text(({tri}) => tri.coord.slice(0, showIndex));
        }
        if(showSides === 'tri') {
            const sides = triangles.flatMap(({tri, center}) => d3.range(3).map(i => {
                const midpoint = average_vectors(...tri.side(i)),
                    point = interpolate_vectors(center, midpoint, 0.7)
                    return {point, label: i};
            }));
            d3.select(`${selector} g#tricoord`)
                .selectAll('path.split').data(rhombuses)
                .join('path')
                .attr('class', 'split')
                .attr('d', ({v2, v4}) => `M${xform(v4.x)},${yform(v4.y)} L${xform(v2.x)},${yform(v2.y)}`)
                .style('stroke', 'black')
                .style('stroke-width', '0.5px')
                .style('opacity', 0.25);
            d3.select(`${selector} g#tricoord`)
                .selectAll('text.side').data(sides)
                .join('text')
                .attr('class', 'side')
                .attr('x', ({point}) => xform(point.x))
                .attr('y', ({point}) => yform(point.y))
                .text(({label}) => label);
        }
    }
    d3.select(`${selector} g#polygon`)
        .selectAll('path.polygon').data([0])
        .join('path')
        .attr('class', 'polygon')
        .attr('d', _ => `M ${polygon[0].print(xform, yform)} ` + polygon.slice(1).map(v => v.print(xform, yform)).join(' ') + ' Z');
}

function getInputValues() {
    var minTiles = document.getElementById("minimum").value;
    var boundsShape = document.querySelector('input[name="init_shape"]:checked').value;
    var resolveRagged = document.querySelector('input[name="resolve_ragged"]:checked').value;
    return {minTiles, boundsShape, resolveRagged};
}

function putInputsInURL() {
    const inputs = getInputValues();
    if(inputs.minTiles !== 50)
        urlParams.set('min', inputs.minTiles);
    else
        urlParams.delete('min');
    if(inputs.boundsShape !== 'square')
        urlParams.set('shape', inputs.boundsShape);
    else
        urlParams.delete('shape');
    if(inputs.resolveRagged !== 'cull')
        urlParams.set('ragged', inputs.resolveRagged);
    else
        urlParams.delete('ragged');
}

function fixPolygon(center, r) {
    urlParams.set('center', center.print());
    urlParams.set('r', r.toFixed(4));
    putInputsInURL();
    window.location.search = urlParams;
}

function unfixPolygon() {
    urlParams.delete('center');
    urlParams.delete('r');
    putInputsInURL();
    window.location.search = urlParams;
}


function drawPenroseTiling() {
    const inputs = getInputValues();
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
        p3Rhombuses, culledRhombuses, fillsIdentified, fillsFound,
        rhombBases, scaleFunction
    } = calculatePenroseTiling(
        +inputs.minTiles, width, height, inputs.boundsShape, startile, inputs.resolveRagged, fixedCenter, fixedR
    );
    const dt = performance.now() - startt;
    const degree_counts = Object.values(p3Rhombuses).reduce((p, {neighbors}) => (p[neighbors.filter(x => x).length]++, p), new Array(5).fill(0));
    const total_border = d3.sum(d3.range(4), degree => degree_counts[degree]);
    const degree_text = d3.range(4).filter(x => degree_counts[x]).map(degree => `<div>border degree ${degree}: ${(degree_counts[degree]/total_border*100).toFixed(0)}%</div>`).join('');
    const fixLink = (!fixedCenter && !fixedR) ?
          '<a id="fix-polygon" href="#">fix</a></div>' :
          '<a id="unfix-polygon" href="#">unfix</a></div>';
    d3.select('#readout').html(
`<div>center: ${center.print()}</div>
<div>r: ${r.toFixed(4)} ${fixLink}<div>
<div>rhombuses: ${Object.keys(p3Rhombuses).length}</div>
<div>triangles found: ${robinsonTriangles.length}</div>` +
            (inputs.resolveRagged === 'cull' ?
`<div>triangles culled: ${culledTriangles.length}</div>
<div>rhombs culled: ${culledRhombuses.length}</div>` :
             inputs.resolveRagged === 'fill' ?
`<div>fills found: ${fillsFound.length}/${fillsIdentified.length}</div>` :
             '') +
            degree_text + 
            (showBaseRhombuses ?
             `<div>rhombus bases: ${rhombBases.length}` : '') +
            `<div>calculation time: ${dt.toFixed(1)}ms</div>`);
    window.setTimeout(() => {
        d3.select('#fix-polygon').on('click', () => fixPolygon(center, r));
        d3.select('#unfix-polygon').on('click', () => unfixPolygon());
    }, 250);
    drawTriangles('svg#gnomon', robinsonTriangles, discardedTriangles.concat(culledTriangles), polygon);
    // svg viewBox distorts things; we want to zoom in without making lines thicker
    // assume svg is wider than tall, and tiles are aspect ratio 1
    const {tl, br} = drawlevel === 'triangle' ?
          calculateTrianglesBB(robinsonTriangles) :
          calculateRhombusesBB(Object.values(p3Rhombuses).map(({rhombus}) => rhombus));
    const twidth = +d3.select('svg#tiles').nodes()[0].clientWidth,
          theight =  +d3.select('svg#tiles').nodes()[0].clientHeight;
    const rwidth = br.x - tl.x, rheight = br.y - tl.y;
    const ofs = new Vector((twidth - theight)/2, 0);
    const scale = new Vector(theight/rheight, theight/rheight);
    if(drawlevel === 'triangle')
        drawTriangles('svg#tiles', robinsonTriangles, culledTriangles, polygon, tl, ofs, scale);
    else if(drawlevel === 'rhombus')
        drawRhombuses('svg#tiles', p3Rhombuses, polygon.map(scaleFunction), tl, ofs, scale);
}

const urlParams = new URLSearchParams(window.location.search);
const mint = urlParams.get('min');
const shape = urlParams.get('shape');
const ragged = urlParams.get('ragged');
const startile = urlParams.get('tile')?.toUpperCase() || 'X';
let showIndex = urlParams.get('coord');
if(showIndex !== null) {
    if(['true', ''].includes(showIndex.toLowerCase()))
        showIndex = 2; // the level shown in Tatham's diagrams
    else if('false' === showIndex.toLowerCase())
        showIndex = null;
    else { 
        showIndex = +showIndex;
        if(showIndex !== showIndex)
            showIndex = null;
    }
}
let showSides = urlParams.get('side');
if(showSides !== null) {
    if(showSides !== 'tri')
        showSides = 'rhomb';
}
const showBaseRhombuses = urlParams.get('base') !== null; // not a good name
const drawlevel = urlParams.get('draw') || 'rhombus';
const urlCenter = urlParams.get('center') || null;
const urlR = urlParams.get('r') || null;

if(mint !== null) {
    d3.select('#minimum').property('value', mint);
    d3.select('#minimumOutput').text(mint);
}

const allowedShapes = d3.selectAll('input[name="init_shape"]').nodes().map(elem => elem.value);
if(shape !== null && allowedShapes.includes(shape))
    d3.selectAll('input[name="init_shape"]').property('checked', function() { return this.value === shape; });
const allowedRagged = d3.selectAll('input[name="resolve_ragged"]').nodes().map(elem => elem.value);
if(ragged !== null && allowedRagged.includes(ragged))
    d3.selectAll('input[name="resolve_ragged"]').property('checked', function() { return this.value === ragged; });

