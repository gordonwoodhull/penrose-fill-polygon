# penrose-fill-polygon

A library to generate P3 tiles inside a polygon, based on [apaleyes/penrose-tiling](https://github.com/apaleyes/penrose-tiling).

Simon Tatham describes a simple algorithm for finding a random tiling of P3 rhombuses in ["Choosing a random patch from a fixed expansion"](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-tilings/#random-patch). This works perfectly for a [Penrose P3 tiling](https://en.wikipedia.org/wiki/Penrose_tiling#Rhombus_tiling_(P3)), so we don't need the more advanced technique he continues into.

We put the polygon in a random place and scale within a golden triangle, then recursively use [Robinson triangle decompositions](https://en.wikipedia.org/wiki/Penrose_tiling#Robinson_triangle_decompositions) to split any triangles which intersect with the polygon, until we have generated enough tiles.

Thanks to Andrei Paleyes for the original [penrose-tiling](https://github.com/apaleyes/penrose-tiling)!

Thanks to Daria Vasyukova [@gereleth](https://twitter.com/gereleth/) for encouraging and helping implement a P3 tiling (watch for it!) for [hexapipes](https://hexapipes.vercel.app/).

