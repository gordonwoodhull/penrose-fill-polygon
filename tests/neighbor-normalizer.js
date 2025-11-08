export function normalizeNeighborOrdering(rhombMap) {
    const normalized = {};
    for (const [coord, rhomb] of Object.entries(rhombMap)) {
        const offset = shouldRotate(rhomb.base) ? 1 : 0;
        const neighbors = rhomb.neighbors || [];
        const rotated = rotate(neighbors, offset);
        normalized[coord] = {
            ...rhomb,
            neighbors: rotated
        };
    }
    return normalized;
}

function shouldRotate(base) {
    if (base === null || base === undefined)
        return false;
    return base % 10 < 5;
}

function rotate(list, offset) {
    if (!offset || list.length === 0)
        return list.slice();
    return list.map((_, i) => list[(i + offset) % list.length]);
}
