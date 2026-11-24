import type { CSSProperties } from 'react';

import {
  plumeTips,
  seededRandom,
  strandDelay,
  strandPath,
} from './plumeGeometry';
import type {
  PlumeFlow,
  SegmentAnimation,
  StrandCount,
} from './plumeGeometry';

import styles from './PlumeLoader.module.css';

interface PlumeGlyphProps {
  strands: StrandCount;
  /** Length of the stem below the base node, in plume units. */
  stem: number;
  strokeWidth: number;
  tipRadius: number;
  baseRadius: number;
  /** Length of one cycle in ms, already scaled for speed. */
  cycleMs: number;
  flow?: PlumeFlow;
  segmentAnimation?: SegmentAnimation;
  /** Seeds the independent timings, so neighbouring plumes differ. */
  seed?: number;
  /** When this plume starts its cycle, in ms. */
  delay?: number;
  /** Multiplies every delay; 2 for the slow speed. */
  delayScale?: number;
  transform?: string;
}

const timing = (delayMs: number, durationMs?: number): CSSProperties => ({
  animationDelay: `${Math.round(delayMs)}ms`,
  ...(durationMs ? { animationDuration: `${Math.round(durationMs)}ms` } : {}),
});

/** Converge runs outer strands first, the mirror of diverge's inner-first. */
const MAX_STRAND_DELAY = 260;

/**
 * One plume as an SVG group: a dim resting track, strands that draw over it,
 * and dots that light as each strand arrives. Diverge draws from the base node
 * out to the tips; converge lights the tips and draws in to the base node,
 * then down the stem. Styles come from PlumeLoader.module.css and read the
 * `--plume-cycle` custom property; the flow is set on the <svg> as
 * `data-flow`.
 */
function PlumeGlyph({
  strands,
  stem,
  strokeWidth,
  tipRadius,
  baseRadius,
  cycleMs,
  flow = 'diverge',
  segmentAnimation = 'concurrent',
  seed = 0,
  delay = 0,
  delayScale = 1,
  transform,
}: PlumeGlyphProps) {
  const tips = plumeTips(strands);
  const stemPath = `M0 ${stem}L0 0`;
  const converging = flow === 'converge';
  const stemDelay = converging ? 400 : 0;
  const baseDelay = converging ? MAX_STRAND_DELAY : 60;

  /** Delay and duration for one strand and its tip dot. */
  const strandTiming = (index: number): CSSProperties => {
    if (segmentAnimation === 'independent') {
      // A random point in its own cycle, at 75–135% of the shared length,
      // so the strands drift in and out of step with each other.
      const offset = seededRandom(seed * 97 + index * 2);
      const length = 0.75 + seededRandom(seed * 97 + index * 2 + 1) * 0.6;
      return timing(-offset * cycleMs, cycleMs * length);
    }
    const stagger = strandDelay(tips[index]);
    const ordered = converging ? MAX_STRAND_DELAY - stagger : stagger;
    return timing((delay + ordered) * delayScale);
  };

  return (
    <g transform={transform}>
      <path
        className={styles.track}
        d={stemPath}
        strokeWidth={strokeWidth}
      />
      {tips.map((tip, index) => (
        <path
          key={`track-${index}`}
          className={styles.track}
          d={strandPath(tip)}
          strokeWidth={strokeWidth}
        />
      ))}
      <path
        className={styles.strand}
        d={stemPath}
        pathLength={1}
        strokeWidth={strokeWidth}
        style={timing((delay + stemDelay) * delayScale)}
      />
      {tips.map((tip, index) => (
        <path
          key={`strand-${index}`}
          className={styles.strand}
          d={strandPath(tip)}
          pathLength={1}
          strokeWidth={strokeWidth}
          style={strandTiming(index)}
        />
      ))}
      {tips.map((tip, index) => (
        <circle
          key={`tip-${index}`}
          className={styles.tip}
          cx={tip[0]}
          cy={tip[1]}
          r={tipRadius}
          style={strandTiming(index)}
        />
      ))}
      <circle
        className={styles.base}
        cx={0}
        cy={0}
        r={baseRadius}
        style={timing((delay + baseDelay) * delayScale)}
      />
    </g>
  );
}

export { PlumeGlyph };
export type { PlumeGlyphProps };
