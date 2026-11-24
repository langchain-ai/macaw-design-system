/*
 * Plume geometry shared by PlumeLoader and the LCThinkingState indicator.
 *
 * A plume is a short stem ending in a base node, from which curved strands
 * fan out like a tulip, each ending in a small dot. Coordinates are in plume
 * units with the base node at (0, 0) and the plume opening toward -y.
 * Strands leave the base close to the plume's axis and bow outward; there is
 * no centre strand, so the middle stays open.
 */

type Point = readonly [x: number, y: number];
type StrandCount = 4 | 6 | 8;

/** Right-hand strand tips, inner to outer. The left side mirrors them. */
const HALF_TIPS: Record<StrandCount, readonly Point[]> = {
  8: [
    [7.5, -18],
    [14, -16.5],
    [19, -14.5],
    [22, -12.5],
  ],
  6: [
    [7.5, -18],
    [15.5, -16],
    [22, -12.5],
  ],
  4: [
    [8, -18],
    [21, -13],
  ],
};

/** Highest point a strand tip reaches, before its dot radius. */
const PLUME_TOP = -18;
/** Widest point a strand tip reaches, before its dot radius. */
const PLUME_HALF_WIDTH = 22;

function plumeTips(strands: StrandCount): Point[] {
  const half = HALF_TIPS[strands];
  return [...half.map(([x, y]): Point => [-x, y]).reverse(), ...half];
}

const fixed = (n: number) => Number(n.toFixed(2));

/** Strand from the base node to a tip, leaving along the axis then bowing out. */
function strandPath([x, y]: Point): string {
  return `M0 0Q${fixed(x * 0.2)} ${fixed(y * 0.78)} ${x} ${y}`;
}

/** Stagger for a strand: inner strands draw first, outer strands last. */
function strandDelay([x]: Point): number {
  return 120 + Math.round((Math.abs(x) / PLUME_HALF_WIDTH) * 140);
}

export { PLUME_HALF_WIDTH, PLUME_TOP, plumeTips, strandDelay, strandPath };
export type { Point, StrandCount };
