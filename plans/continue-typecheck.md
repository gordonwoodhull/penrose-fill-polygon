1. Annotate helper functions
   - `truncate_float`, `rhomb_key`, `calculateTrianglesBB`, `calculateRhombusesBB`, `scaleVector`, `calculateBaseRhombuses`, and `lighten` still accept/return `any`; give them explicit signatures (`number`, `Vector`, `Rhombus`, etc.) so downstream code sees concrete types instead of `unknown`.

2. Strongly type triangle/rhomb collections
   - After `generateTriangles` returns, `triangles` and `discarded` are typed as `TriangleLike[]`, but later we still get `unknown` because `tri.split()` returns `Triangle[]`. Cast `tri.split()` appropriately or constrain `TriangleLike` so the compiler knows each element is a `Triangle`.
   - Annotate the loops that build rhombuses (`for (const [coord, {tri1, tri2, rhombus}] of Object.entries(rhombhash))`) by defining an interface for the rhombhash entries. That removes the `unknown` errors when accessing `rhombus`, `tri1`, etc.

3. Finish typing `calculatePenroseTiling`
   - Add parameter/return types, including literal unions for `startTile` (`'C' | 'D' | 'X' | 'Y'`) and `resolveRagged`. Replace the `startri` references with `startTriangle` (or reintroduce the variable) so TypeScript doesn’t flag the undefined identifier.
   - Type the `shape_spec` entries with an explicit interface so `regularPolygon` doesn’t need `keyof typeof shape_spec`.

4. Update `src/tatham-triangle.ts`
   - Give explicit parameter/return types to `splitPoint`, each `startTile`, and each `split()` method. Because they extend `Triangle`, the constructors and methods should declare `Vector` and string types so TypeScript stops inferring `any`.

5. Re-run `npm run typecheck` and iterate
   - After the helpers and Tatham module are typed, re-run the checker to surface any remaining gaps (likely the rhombus scaling code or neighbor assembly). Address the residual `unknown` warnings by defining small interfaces or type aliases for the interim objects stored in maps (`rhombhash`, `tri2rhomb`, etc.).
