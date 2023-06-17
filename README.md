# penrose-fill-polygon

A library to generate P3 tiles inside a polygon, based on [apaleyes/penrose-tiling](https://github.com/apaleyes/penrose-tiling).

This is a work in progress, currently [a demo](https://gordonwoodhull.github.io/penrose-fill-polygon/penrose.html) of filling an approximate number of random Penrose tiles, specifically Robinson triangles, in a polygon. The goal is a library which produces tile coordinates & rotation, as well as adjacency information. 

Simon Tatham describes a simple algorithm for finding a random tiling of P3 rhombuses in ["Choosing a random patch from a fixed expansion"](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-tilings/#random-patch). This works perfectly for a [Penrose P3 tiling](https://en.wikipedia.org/wiki/Penrose_tiling#Rhombus_tiling_(P3)), so we don't need the more advanced technique he describes later. 

We put the polygon in a random place and scale inside a [golden gnomon](https://en.wikipedia.org/wiki/Golden_triangle_(mathematics)), an isosceles triangles with an  inverse [golden ratio](https://en.wikipedia.org/wiki/Golden_ratio) between the length of the equal sides and the length of the base.

Then we recursively split any triangles which intersect the polygon using [Robinson triangle decompositions](https://en.wikipedia.org/wiki/Penrose_tiling#Robinson_triangle_decompositions), and throw out the non-intersecting triangles, until we have generated enough tiles.

We also use Tatham's ["Combinatorial coordinates"](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-tilings/#ccoords), a triangle naming system to keep track of which triangles neighbor which. He doesn't fully describe the last step:

> So we need to remember which segment of the larger edge we were crossing: were we to the left or the right of the division?

> We’ll always expect to find that the incoming edge of the new large triangle is subdivided into segments in the same way, and the map for that triangle will let us find which sub-triangle corresponds to each segment of the outer edge. So you can still figure out which sub-triangle you end up in.

The "map for that triangle" is `rtri_entries` in this implementation. Seems like a lot of data between that and `tri_neighbors`, so I wouldn't be surprised if there is redundancy here.

Thanks to Andrei Paleyes for the original [penrose-tiling](https://github.com/apaleyes/penrose-tiling), which provides the Robinson triangle-splitting algorithm.

Thanks to Daria Vasyukova [@gereleth](https://twitter.com/gereleth/) for encouraging and helping implement a P3 tiling for [hexapipes](https://hexapipes.vercel.app/). (Watch for it!)

