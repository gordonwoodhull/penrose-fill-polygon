# Plan: Rebuild Context for Penrose Tiling Codebase

This plan assumes no prior knowledge of the repository and outlines how to regain the level of understanding we had before exploring canonical triangles.

## 1. High-Level Orientation

1. Read `README.md` to understand the project’s purpose: generating Penrose P3 tilings and exposing them for demos/clients.
2. Skim the directory tree (`src`, tests, assets) to identify key modules and artifacts (`penrose-bundle.js`, tests, images).
3. Note dependencies from `package.json`: `d3-array`, `d3-random`, `esbuild`, `vitest`, etc.

## 2. Core Geometry & Splitting

1. Open `src/geometry.ts` (or the equivalent geometry file) to review:
   - `Vector` helper methods.
   - `Triangle` base class and derivatives (`TriangleC`, `TriangleD`, `TriangleX`, `TriangleY`).
   - Splitting logic for each triangle type; verify how children are constructed and colored (blue/red).
2. Understand supporting helpers like `average_vectors`, `interpolate_vectors`, and `trianglesIntersect`.

## 3. Tiling Pipeline

1. Study `src/index.ts` (main entry point):
   - How `calculatePenroseTiling` seeds the tiling (triangle selection, polygon selection).
   - `generateTriangles`: iterate + filter triangles within a polygon.
   - Pairing triangles into rhombuses, building neighbor maps, scaling, and metadata collection.
2. Review helper functions:
   - `regularPolygon`, `triangulate`, `calculateBaseRhombuses`, bounding-box utilities, scaling logic.

## 4. Client Interactions

1. Examine `hexapipes/src/lib/puzzle/grids/penrosegrid.js` (or equivalent client):
   - How the client consumes `calculatePenroseTiling`.
   - How rhombus metadata is used: neighbors, rotation offsets, rendering helpers.
2. Note any client-side adjustments (e.g., `fix_rotation_offsets`) to understand current expectations.

## 5. Tests & Deterministic Fixtures

1. Run `npm test` to ensure the suite passes; review key tests:
   - Regression tests (`tests/penrose-*.test.js`) locking down rhombus counts, neighbor order, etc.
   - Triangle split tests (`tests/triangle-*.test.js`) capturing current vertex ordering from legacy splits.
2. Understand the deterministic inputs used in tests (fixed seeds, geometry snapshots).

## 6. Build & Tooling

1. Confirm build pipeline (`npm run build`) bundles `src/index.ts` with esbuild.
2. Ensure `tsc --emitDeclarationOnly` (or equivalent) runs cleanly if TypeScript declarations are emitted.

## 7. Known Pain Points (Pre-Canonical)

1. Legacy triangles use a vertex ordering that doesn’t match the Tatham diagram; clients compensate.
2. Rhombus base matching sometimes fails due to inconsistent vertex ordering.
3. Neighbor ordering requires client-side rotation (`fix_rotation_offsets`), indicating data cleanup opportunities.

## 8. Next Steps Once Context Is Restored

1. Document the desired “canonical” triangle orientation (side numbering vs. edges) separate from legacy implementations.
2. Plan phased refactors (if needed) that introduce canonical concepts without breaking the existing pipeline.
3. Identify integration boundaries (e.g., rhombus assembly) where adapters or transformations would be applied.

Following this plan will recreate the pre-canonical-triangle understanding of the codebase, setting the stage for any future redesigns.
