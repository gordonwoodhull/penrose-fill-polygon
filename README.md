# penrose-fill-polygon

A library to generate P3 tiles inside a polygon, based on [apaleyes/penrose-tiling](https://github.com/apaleyes/penrose-tiling).

[Demo here](https://gordonwoodhull.github.io/penrose-fill-polygon/penrose.html)

This library fills an approximate number of random rhombus Penrose tiles in a polygon, and calculates the neighbors of those rhombuses.

It uses an algorithm described by Simon Tatham in ["Choosing a random patch from a fixed expansion"](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-tilings/#random-patch). (This works perfectly for a [Penrose P3 tiling](https://en.wikipedia.org/wiki/Penrose_tiling#Rhombus_tiling_(P3)), so we don't need the more advanced technique he describes later.)

We put the polygon in a random place and scale inside a starting Robinson triangle. By default, a [golden gnomon](https://en.wikipedia.org/wiki/Golden_triangle_(mathematics)) is used. This is an isosceles triangles with an inverse [golden ratio](https://en.wikipedia.org/wiki/Golden_ratio) between the length of the equal sides and the length of the base.

Then we recursively split any triangles which intersect the polygon using [Robinson triangle decompositions](https://en.wikipedia.org/wiki/Penrose_tiling#Robinson_triangle_decompositions), and throw out the non-intersecting triangles, until we have generated enough tiles.

We also use Tatham's [combinatorial coordinates](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-tilings/#ccoords) to deduce which triangles are neighbors. From there, we know which triangles to combine into rhombuses, and which rhombuses are neighbors.

Finally, we need to coalesce matching triangles into rhombuses, and clean up the border to avoid ragged edges (characterized by gaps and tiles connected by one or less sides). This part of the library is a work in progress. Currently there are two algorithms:
* "Cull", which removes any half-rhombs and repeatedly removes any rhombus which only has one neighbor.
* "Fill", which instead generates the other half of rhombuses when the first half has two neighbors.

If you are interested in contributing to this library, help is welcome:
* Breaking up the monolithic function into a more modular approach, especially if you have a use case that demands more flexibility.
* Improving and debugging the ragged border resolution algorithms.

Thanks to Andrei Paleyes for the original [penrose-tiling](https://github.com/apaleyes/penrose-tiling), which provides the Robinson triangle-splitting algorithm.

Thanks to Daria Vasyukova [@gereleth](https://twitter.com/gereleth/) for encouraging and helping implement a P3 tiling for [hexapipes](https://hexapipes.vercel.app/). (Watch for it!)

