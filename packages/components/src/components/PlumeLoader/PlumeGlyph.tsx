import type { CSSProperties } from 'react';

import { plumeTips, strandDelay, strandPath } from './plumeGeometry';
import type { StrandCount } from './plumeGeometry';

import styles from './PlumeLoader.module.css';

interface PlumeGlyphProps {
  strands: StrandCount;
  /** Length of the stem below the base node, in plume units. */
  stem: number;
  strokeWidth: number;
  tipRadius: number;
  baseRadius: number;
  /** When this plume starts its cycle, in ms. */
  delay?: number;
  /** Multiplies every delay; 2 for the slow speed. */
  delayScale?: number;
  transform?: string;
}

const delayStyle = (ms: number): CSSProperties => ({
  animationDelay: `${Math.round(ms)}ms`,
});

/**
 * One plume as an SVG group: a dim resting track, strands that draw out over
 * it, and tip dots that light as each strand arrives. Styles come from
 * PlumeLoader.module.css and read the `--plume-cycle` custom property.
 */
function PlumeGlyph({
  strands,
  stem,
  strokeWidth,
  tipRadius,
  baseRadius,
  delay = 0,
  delayScale = 1,
  transform,
}: PlumeGlyphProps) {
  const tips = plumeTips(strands);
  const stemPath = `M0 ${stem}L0 0`;

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
        style={delayStyle(delay * delayScale)}
      />
      {tips.map((tip, index) => (
        <path
          key={`strand-${index}`}
          className={styles.strand}
          d={strandPath(tip)}
          pathLength={1}
          strokeWidth={strokeWidth}
          style={delayStyle((delay + strandDelay(tip)) * delayScale)}
        />
      ))}
      {tips.map((tip, index) => (
        <circle
          key={`tip-${index}`}
          className={styles.tip}
          cx={tip[0]}
          cy={tip[1]}
          r={tipRadius}
          style={delayStyle((delay + strandDelay(tip)) * delayScale)}
        />
      ))}
      <circle
        className={styles.tip}
        cx={0}
        cy={0}
        r={baseRadius}
        style={delayStyle((delay + 60) * delayScale)}
      />
    </g>
  );
}

export { PlumeGlyph };
export type { PlumeGlyphProps };
