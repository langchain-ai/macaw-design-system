// Proof of concept: the plume from the GTM agent intro animation as a loader.
// `plume` draws one full-size plume; `field` tiles hubs of four plumes into a
// network that lights in a wave from the centre outward.
import { forwardRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { PlumeGlyph } from './PlumeGlyph';

import styles from './PlumeLoader.module.css';

/** Distance between hub centres in the field, in plume units. */
const PITCH = 104;
/** Stem length from a hub to each of its plumes' base nodes. */
const FIELD_STEM = 13;
const ROTATIONS = [0, 90, 180, 270];
const CORNERS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

interface PlumeStyle extends CSSProperties {
  '--plume-cycle': string;
}

interface PlumeLoaderProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  /** One full-size plume, or a network pattern of plumes. */
  variant?: 'plume' | 'field';
  /** Plume: width and height in px. Field: height in px; width fills the container. */
  size?: number;
  /** Field only: hubs across and down. */
  columns?: number;
  rows?: number;
  /** Brand is LangChain primary blue (#006DDD); neutral follows the icon colour. */
  tone?: 'neutral' | 'brand';
  /** Reduced-motion preferences always take precedence. */
  animated?: boolean;
  speed?: 'normal' | 'slow';
  /** Announced to assistive technology. */
  label?: ReactNode;
}

function SinglePlume({ delayScale }: { delayScale: number }) {
  return (
    <>
      <circle className={styles.ring} cx={0} cy={16} r={5} strokeWidth={0.3} />
      <PlumeGlyph
        strands={8}
        stem={16}
        strokeWidth={0.32}
        tipRadius={0.6}
        baseRadius={0.8}
        delayScale={delayScale}
      />
      <circle className={styles.hub} cx={0} cy={16} r={2} />
    </>
  );
}

function PlumeField({
  columns,
  rows,
  delayScale,
}: {
  columns: number;
  rows: number;
  delayScale: number;
}) {
  const centreX = (columns - 1) / 2;
  const centreY = (rows - 1) / 2;
  const hubs = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const x = column * PITCH;
      const y = row * PITCH;
      // The wave starts at the centre hub and travels outward.
      const wave = Math.hypot(column - centreX, row - centreY) * 520;
      hubs.push(
        <g key={`${column}-${row}`}>
          {ROTATIONS.map((rotation, index) => (
            <PlumeGlyph
              key={rotation}
              strands={8}
              stem={FIELD_STEM}
              strokeWidth={0.32}
              tipRadius={0.55}
              baseRadius={0.75}
              delay={wave + index * 40}
              delayScale={delayScale}
              transform={`translate(${x} ${y}) rotate(${rotation}) translate(0 ${-FIELD_STEM})`}
            />
          ))}
          {CORNERS.map(([dx, dy]) => (
            <path
              key={`${dx}${dy}`}
              className={styles.tick}
              d={`M${x + dx * 27} ${y + dy * 23}L${x + dx * 27} ${y + dy * 27}L${x + dx * 23} ${y + dy * 27}`}
              strokeWidth={0.35}
            />
          ))}
          <circle
            className={styles.ring}
            cx={x}
            cy={y}
            r={8}
            strokeWidth={0.35}
          />
          <circle
            className={styles.hub}
            cx={x}
            cy={y}
            r={3}
            style={{ animationDelay: `${Math.round(wave * delayScale)}ms` }}
          />
        </g>
      );
    }
  }
  return <>{hubs}</>;
}

/** Loader built from LangChain plumes. Proof of concept. */
const PlumeLoader = forwardRef<HTMLDivElement, PlumeLoaderProps>(
  function PlumeLoader(
    {
      variant = 'plume',
      size,
      columns = 5,
      rows = 3,
      tone = 'brand',
      animated = true,
      speed = 'normal',
      label = 'Loading',
      className,
      style,
      ...props
    },
    ref
  ) {
    const delayScale = speed === 'slow' ? 2 : 1;
    const cycle = variant === 'field' ? 5200 : 2000;
    const plumeStyle: PlumeStyle = {
      '--plume-cycle': `${cycle * delayScale}ms`,
    };
    const isField = variant === 'field';
    const height = size ?? (isField ? 312 : 160);

    return (
      <div
        {...props}
        ref={ref}
        role="status"
        className={cn(
          isField ? 'block w-full' : 'inline-block',
          tone === 'brand' ? styles.brand : 'text-icon-primary',
          className
        )}
        style={style}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          className={styles.svg}
          data-animated={animated}
          width={isField ? '100%' : height}
          height={height}
          viewBox={
            isField
              ? `${-PITCH / 2} ${-PITCH / 2} ${columns * PITCH} ${rows * PITCH}`
              : '-25 -25 50 50'
          }
          preserveAspectRatio={isField ? 'xMidYMid slice' : undefined}
          style={plumeStyle}
        >
          {isField ? (
            <PlumeField
              columns={columns}
              rows={rows}
              delayScale={delayScale}
            />
          ) : (
            <SinglePlume delayScale={delayScale} />
          )}
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

export { PlumeLoader };
export type { PlumeLoaderProps };
