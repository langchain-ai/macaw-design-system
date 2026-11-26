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

/**
 * diverge: from the single point out to the tips.
 * converge: from the tips in to the single point.
 */
type PlumeFlow = 'diverge' | 'converge';

/**
 * concurrent: every strand runs on the plume's shared timeline.
 * independent: each strand runs on its own randomised delay and duration.
 */
type SegmentAnimation = 'concurrent' | 'independent';

/** Where the plume's single point sits; the strands open the other way. */
type ConvergePoint = 'down' | 'up' | 'left' | 'right';

/** Rotation, in degrees, from the drawn orientation (point at the bottom). */
const CONVERGE_POINT_ROTATION: Record<ConvergePoint, number> = {
  down: 0,
  left: 90,
  up: 180,
  right: 270,
};

/** When the hub at the end of the stem pulses, relative to the plume's start. */
function hubDelay(flow: PlumeFlow): number {
  return flow === 'converge' ? 900 : 0;
}

/** Deterministic 0–1 random from an integer seed, so renders stay stable. */
function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export {
  CONVERGE_POINT_ROTATION,
  PLUME_HALF_WIDTH,
  PLUME_TOP,
  hubDelay,
  plumeTips,
  seededRandom,
  strandDelay,
  strandPath,
};
export type {
  ConvergePoint,
  PlumeFlow,
  Point,
  SegmentAnimation,
  StrandCount,
};
