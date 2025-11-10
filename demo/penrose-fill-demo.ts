import {
    Vector,
    average_vectors,
    interpolate_vectors,
    calculatePenroseTiling,
    tatham_neighbor_or_null,
    calculateTrianglesBB,
    calculateRhombusesBB,
    Rhombus,
    type Triangle,
    type PenroseTilingResult
} from '../src/index';

type RhombusEntry = NonNullable<PenroseTilingResult['p3Rhombuses'][string]>;
type RhombusMap = PenroseTilingResult['p3Rhombuses'];
type TriangleWithCenter = {tri: Triangle; center: Vector};
type TriangleSideLabel = {coord: string; point: Vector; label: number};
type RhombusSideLabel = {point: Vector; label: number};
type BoundsShape = 'square' | 'pentagon' | 'hexagon';
type ResolveRaggedMode = 'none' | 'cull' | 'fill';
type TriangleKind = 'C' | 'D' | 'X' | 'Y';

interface InputValues {
    minTiles: number;
    boundsShape: BoundsShape;
    resolveRagged: ResolveRaggedMode;
}

declare const d3: any;

function highlightTriNeighbors(selector: string, coord: string): void {
    const neighbors = [0, 1, 2].map(side => tatham_neighbor_or_null(coord, side as 0 | 1 | 2));
    d3.selectAll(`${selector} g#triangles text.robinson`)
        .classed('over', (d: Triangle) => d.coord === coord)
        .classed('side0', (d: Triangle) => d.coord === neighbors[0])
        .classed('side1', (d: Triangle) => d.coord === neighbors[1])
        .classed('side2', (d: Triangle) => d.coord === neighbors[2]);
    d3.selectAll(`${selector} g#triangles path.robinson`)
        .classed('over', (d: Triangle) => d.coord === coord)
        .classed('side0', (d: Triangle) => d.coord === neighbors[0])
        .classed('side1', (d: Triangle) => d.coord === neighbors[1])
        .classed('side2', (d: Triangle) => d.coord === neighbors[2]);
}

function drawTriangles(
    selector: string,
    triangles: Triangle[],
    discarded: Triangle[],
    polygon: Vector[],
    tl: Vector | null = null,
    ofs: Vector | null = null,
    scale: Vector | null = null
): void {
    const tlv = tl ?? new Vector(0, 0);
    const ofsv = ofs ?? new Vector(0, 0);
    const scalev = scale ?? new Vector(1, 1);
    const xform = (x: number) => (x - tlv.x) * scalev.x + ofsv.x;
    const yform = (y: number) => (y - tlv.y) * scalev.y + ofsv.y;
    const allTris = triangles.concat(discarded);
    d3.select(`${selector} g#triangles`)
        .selectAll('path.robinson').data(allTris)
        .join('path')
        .attr('class', 'robinson')
        .attr('d', (tri: Triangle) => `M ${xform(tri.v1.x)}, ${yform(tri.v1.y)} L ${xform(tri.v2.x)}, ${yform(tri.v2.y)} L ${xform(tri.v3.x)}, ${yform(tri.v3.y)} Z`)
        .style('fill', (tri: Triangle) => tri.fillColor)
        .on('mouseover', (_: Event, d: Triangle) => highlightTriNeighbors(selector, d.coord));
    if(showIndex) {
        const maxCoordLen = 9;
        d3.select(`${selector} g#triangles`)
            .selectAll('text.robinson').data(allTris)
            .join('text')
            .attr('class', 'robinson')
            .attr('x', (tri: Triangle) => xform((tri.v1.x + tri.v2.x + tri.v3.x) / 3))
            .attr('y', (tri: Triangle) => yform((tri.v1.y + tri.v2.y + tri.v3.y) / 3))
            .style('opacity', ({coord}: Triangle) => d3.easeCubicOut((maxCoordLen - coord.length)/maxCoordLen))
            .text((tri: Triangle) => tri.coord)
            .on('mouseover', (_: Event, d: Triangle) => highlightTriNeighbors(selector, d.coord));
    }
    if(!polygon.length)
        return;
    if(!polygon.length)
        return;
    d3.select(`${selector} g#polygon`)
        .selectAll('path.polygon').data([0])
        .join('path')
        .attr('class', 'polygon')
        .attr('d', () => `M ${polygon[0].print(xform, yform)} ` + polygon.slice(1).map(v => v.print(xform, yform)).join(' ') + ' Z');
}

function highlightRhombNeighbors(selector: string, rhombhash: RhombusMap, coord: string | null): void {
    const neighbors = coord ? rhombhash[coord]?.neighbors ?? [null, null, null, null] : [null, null, null, null];
    d3.selectAll(`${selector} g#rhombuses text.robinson`)
        .classed('over', (d: RhombusEntry) => d.rhombus.coord === coord)
        .classed('side0', (d: RhombusEntry) => d.rhombus.coord === neighbors[0])
        .classed('side1', (d: RhombusEntry) => d.rhombus.coord === neighbors[1])
        .classed('side2', (d: RhombusEntry) => d.rhombus.coord === neighbors[2])
        .classed('side3', (d: RhombusEntry) => d.rhombus.coord === neighbors[3]);
    d3.selectAll(`${selector} g#rhombuses path.robinson`)
        .classed('over', (d: RhombusEntry) => d.rhombus.coord === coord)
        .classed('side0', (d: RhombusEntry) => d.rhombus.coord === neighbors[0])
        .classed('side1', (d: RhombusEntry) => d.rhombus.coord === neighbors[1])
        .classed('side2', (d: RhombusEntry) => d.rhombus.coord === neighbors[2])
        .classed('side3', (d: RhombusEntry) => d.rhombus.coord === neighbors[3]);
}

function drawRhombuses(
    selector: string,
    rhombhash: RhombusMap,
    polygon: Vector[],
    tl: Vector | null = null,
    ofs: Vector | null = null,
    scale: Vector | null = null
): void {
    const tlv = tl ?? new Vector(0, 0);
    const ofsv = ofs ?? new Vector(0, 0);
    const scalev = scale ?? new Vector(1, 1);
    const xform = (x: number) => (x - tlv.x) * scalev.x + ofsv.x;
    const yform = (y: number) => (y - tlv.y) * scalev.y + ofsv.y;
    const rhombEntries = Object.values(rhombhash);
    const rhombuses = rhombEntries.map(({rhombus}) => rhombus);
    const categorical_colors = ((d3.schemeTableau10 ?? []).concat(d3.schemeSet3 ?? [])).filter(Boolean);
    if(!categorical_colors.length)
        categorical_colors.push('#888');
    d3.select(`${selector} g#rhombuses`)
        .selectAll('path.robinson').data(rhombEntries)
        .join('path')
        .attr('class', 'robinson')
        .attr('d', ({rhombus: rh}: RhombusEntry) => `M ${xform(rh.v1.x)}, ${yform(rh.v1.y)} L ${xform(rh.v2.x)}, ${yform(rh.v2.y)} L ${xform(rh.v3.x)}, ${yform(rh.v3.y)} L ${xform(rh.v4.x)}, ${yform(rh.v4.y)} Z`)
        .style('fill', (entry: RhombusEntry) => showBaseRhombuses && entry.base !== null ? categorical_colors[entry.base % categorical_colors.length] : entry.rhombus.fillColor)
        .on('mouseover', (_: Event, d: RhombusEntry) => highlightRhombNeighbors(selector, rhombhash, d.rhombus.coord))
        .on('mouseout', () => highlightRhombNeighbors(selector, rhombhash, null));
    if(showBaseRhombuses) {
        d3.select(`${selector} g#rhombuses`)
            .selectAll('text.robinson').data(rhombEntries)
            .join('text')
            .attr('class', 'robinson')
            .attr('x', ({rhombus}: RhombusEntry) => xform((rhombus.v1.x + rhombus.v2.x + rhombus.v3.x + rhombus.v4.x) / 4))
            .attr('y', ({rhombus}: RhombusEntry) => yform((rhombus.v1.y + rhombus.v2.y + rhombus.v3.y + rhombus.v4.y) / 4))
            .text((entry: RhombusEntry) => entry.base ?? '');
    }
    if(showIndex || showSides) {
        const triangles: TriangleWithCenter[] = rhombEntries.flatMap(({tri1scale, tri2scale}) => {
            const entries: TriangleWithCenter[] = [];
            if(tri1scale)
                entries.push({tri: tri1scale, center: tri1scale.center()});
            if(tri2scale)
                entries.push({tri: tri2scale, center: tri2scale.center()});
            return entries;
        });
        if(showIndex) {
            d3.select(`${selector} g#coord`)
                .selectAll('text.robinson').data(triangles)
                .join('text')
                .attr('class', ({tri}: TriangleWithCenter) => 'robinson ' + tri.coord.slice(0,1))
                .attr('x', ({center}: TriangleWithCenter) => xform(center.x))
                .attr('y', ({center}: TriangleWithCenter) => yform(center.y))
                .text(({tri}: TriangleWithCenter) => tri.coord.slice(0, showIndex!));
        }
        if(showSides === 'tri') {
            const sides: TriangleSideLabel[] = triangles.flatMap(({tri, center}) => {
                return [0, 1, 2].map(i => {
                    const side = tri.side(i as 0 | 1 | 2);
                    if(!side)
                        return null;
                    const midpoint = average_vectors(...side);
                    const point = interpolate_vectors(center, midpoint, 0.7);
                    return {coord: tri.coord, point, label: i};
                }).filter((val): val is TriangleSideLabel => Boolean(val));
            });
            d3.select(`${selector} g#coord`)
                .selectAll('path.split').data(rhombuses)
                .join('path')
                .attr('class', 'split')
                .attr('d', ({v2, v4}: Rhombus) => `M${xform(v4.x)},${yform(v4.y)} L${xform(v2.x)},${yform(v2.y)}`)
                .style('stroke', 'black')
                .style('stroke-width', '0.5px')
                .style('opacity', 0.25);
            d3.select(`${selector} g#coord`)
                .selectAll('text.side').data(sides)
                .join('text')
                .attr('class', ({coord}: TriangleSideLabel) => 'side ' + coord.slice(0,1))
                .attr('x', ({point}: TriangleSideLabel) => xform(point.x))
                .attr('y', ({point}: TriangleSideLabel) => yform(point.y))
                .text(({label}: TriangleSideLabel) => label.toString());
        }
        else if(showSides === 'rhomb') {
            const sides: RhombusSideLabel[] = rhombuses.flatMap(rhomb => {
                const center = average_vectors(rhomb.v1, rhomb.v3);
                return [0, 1, 2, 3].map(i => {
                    const side = rhomb.side(i as 0 | 1 | 2 | 3);
                    if(!side)
                        return null;
                    const midpoint = average_vectors(...side);
                    const point = interpolate_vectors(center, midpoint, 0.8);
                    return {point, label: i};
                }).filter((val): val is RhombusSideLabel => Boolean(val));
            });
            d3.select(`${selector} g#coord`)
                .selectAll('text.side').data(sides)
                .join('text')
                .attr('class', 'side')
                .attr('x', ({point}: RhombusSideLabel) => xform(point.x))
                .attr('y', ({point}: RhombusSideLabel) => yform(point.y))
                .text(({label}: RhombusSideLabel) => label.toString());
        }
    }
    d3.select(`${selector} g#polygon`)
        .selectAll('path.polygon').data([0])
        .join('path')
        .attr('class', 'polygon')
        .attr('d', () => `M ${polygon[0].print(xform, yform)} ` + polygon.slice(1).map(v => v.print(xform, yform)).join(' ') + ' Z');
}

function getInputValues(): InputValues {
    const minInput = document.getElementById('minimum') as HTMLInputElement | null;
    const minTiles = minInput ? Number(minInput.value) : 50;
    const boundsShapeElement = document.querySelector<HTMLInputElement>('input[name="init_shape"]:checked');
    const boundsShape = (boundsShapeElement?.value ?? 'square') as BoundsShape;
    const resolveElement = document.querySelector<HTMLInputElement>('input[name="resolve_ragged"]:checked');
    const resolveRagged = (resolveElement?.value ?? 'cull') as ResolveRaggedMode;
    return {minTiles, boundsShape, resolveRagged};
}

function putInputsInURL(): void {
    const inputs = getInputValues();
    if(inputs.minTiles !== 50)
        urlParams.set('min', String(inputs.minTiles));
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

function fixPolygon(center: Vector, r: number): void {
    urlParams.set('center', center.print());
    urlParams.set('r', r.toFixed(4));
    putInputsInURL();
    window.location.search = urlParams.toString();
}

function unfixPolygon(): void {
    urlParams.delete('center');
    urlParams.delete('r');
    putInputsInURL();
    window.location.search = urlParams.toString();
}


function drawPenroseTiling(): void {
    const inputs = getInputValues();
    const gnomon = document.querySelector<SVGSVGElement>('svg#gnomon');
    const tiles = document.querySelector<SVGSVGElement>('svg#tiles');
    if(!gnomon || !tiles)
        throw new Error('Required SVG elements not found');
    const width = gnomon.clientWidth;
    const height = gnomon.clientHeight;
    let fixedCenter: Vector | null = null;
    let fixedR: number | null = null;
    if(urlCenter) {
        const parsed = urlCenter.split(',').map(x => Number(x));
        if(parsed.length === 2 && parsed.every(val => !Number.isNaN(val)))
            fixedCenter = new Vector(parsed[0], parsed[1]);
    }
    if(urlR) {
        const parsedR = Number(urlR);
        fixedR = Number.isNaN(parsedR) ? null : parsedR;
    }
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
    const degreeCounts = Object.values(p3Rhombuses).reduce((counts, {neighbors}) => {
        const deg = neighbors.filter((x): x is string => Boolean(x)).length;
        counts[deg] = (counts[deg] ?? 0) + 1;
        return counts;
    }, [0, 0, 0, 0, 0]);
    const totalBorder = degreeCounts.slice(0, 4).reduce((sum, count) => sum + count, 0);
    const degreeText = degreeCounts
        .slice(0, 4)
        .map((count, degree) => count ? `<div>border degree ${degree}: ${(totalBorder ? (count / totalBorder * 100) : 0).toFixed(0)}%</div>` : '')
        .join('');
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
            degreeText + 
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
    const twidth = tiles.clientWidth;
    const theight = tiles.clientHeight;
    const rwidth = br.x - tl.x;
    const rheight = br.y - tl.y || 1;
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
const startParam = urlParams.get('tile')?.toUpperCase();
const allowedStartTiles: TriangleKind[] = ['C', 'D', 'X', 'Y'];
const startile: TriangleKind = startParam && allowedStartTiles.includes(startParam as TriangleKind) ?
      startParam as TriangleKind : 'X';
const coordParam = urlParams.get('coord');
let showIndex: number | null = null;
if(coordParam !== null) {
    if(['true', ''].includes(coordParam.toLowerCase()))
        showIndex = 2;
    else if('false' !== coordParam.toLowerCase()) {
        const parsed = Number(coordParam);
        showIndex = Number.isNaN(parsed) ? null : parsed;
    }
}
let showSidesParam = urlParams.get('side');
let showSides: 'tri' | 'rhomb' | null = null;
if(showSidesParam !== null)
    showSides = showSidesParam === 'tri' ? 'tri' : 'rhomb';
const showBaseRhombuses = urlParams.get('base') !== null;
const drawlevel: 'triangle' | 'rhombus' = urlParams.get('draw') === 'triangle' ? 'triangle' : 'rhombus';
const urlCenter = urlParams.get('center');
const urlR = urlParams.get('r');

if(mint !== null) {
    const minElement = document.getElementById('minimum') as HTMLInputElement | null;
    const minOutput = document.getElementById('minimumOutput');
    if(minElement) minElement.value = mint;
    if(minOutput) minOutput.textContent = mint;
}

const shapeInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="init_shape"]'));
if(shape !== null && shapeInputs.some(elem => elem.value === shape)) {
    shapeInputs.forEach(elem => { elem.checked = elem.value === shape; });
}
const raggedInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="resolve_ragged"]'));
if(ragged !== null && raggedInputs.some(elem => elem.value === ragged)) {
    raggedInputs.forEach(elem => { elem.checked = elem.value === ragged; });
}

window.addEventListener('load', () => drawPenroseTiling());
