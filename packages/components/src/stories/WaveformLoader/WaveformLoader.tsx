import { useEffect, useRef } from 'react';

import styles from './WaveformLoader.module.css';

const SPEEDS = { slow: 500, medium: 250, fast: 100 } as const;
const LINE_COUNT = 20;
const SAMPLE_COUNT = 120;
const WIDTH = 1920;
const HEIGHT = 1080;

function smootherstep(start: number, end: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t ** 3 * (t * (t * 6 - 15) + 10);
}

function createPath(line: number, time = 0, hasCenterPoint = false) {
  const phase = line * 2.4;
  const spread = (line / (LINE_COUNT - 1)) * 2 - 1;
  const frequency = 1.5 + Math.sin(time * 0.05 + phase) * 0.65;
  const amplitude = 0.65 + Math.sin(time * 0.31 + phase) * 0.25;

  return Array.from({ length: SAMPLE_COUNT + 1 }, (_, sample) => {
    const x = sample / SAMPLE_COUNT;
    const taper = smootherstep(0, 0.12, x) * (1 - smootherstep(0.04, 0.86, x));
    const envelope =
      taper * (hasCenterPoint ? Math.sin(Math.PI * 2 * x) ** 2 : 1);
    const wave = Math.sin(x * Math.PI * 2 * frequency - time * 0.7 + phase);
    const y = HEIGHT / 2 + envelope * wave * spread * amplitude * HEIGHT * 0.4;
    return `${sample === 0 ? 'M' : 'L'}${x * WIDTH},${y.toFixed(2)}`;
  }).join(' ');
}

const LINES = Array.from({ length: LINE_COUNT }, (_, line) => line);

interface WaveformLoaderProps {
  speed?: keyof typeof SPEEDS;
  hasCenterPoint?: boolean;
  showLayering?: boolean;
  className?: string;
}

function WaveformLoader({
  speed = 'medium',
  hasCenterPoint = false,
  showLayering = false,
  className,
}: WaveformLoaderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const duration = SPEEDS[speed];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const paths = svgRef.current?.querySelectorAll('path');
    const rates = LINES.map(() => 0.5 + Math.random());
    let frame: number;

    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (preference.matches) {
        paths?.forEach((path, line) =>
          path.setAttribute('d', createPath(line, 0, hasCenterPoint))
        );
        return;
      }

      let started: number | undefined;
      const animate = (time: number) => {
        started ??= time;
        const elapsed = (time - started) / duration;
        paths?.forEach((path, line) => {
          path.setAttribute(
            'd',
            createPath(line, elapsed * rates[line], hasCenterPoint)
          );
        });
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    };

    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', updateMotion);
    };
  }, [duration, hasCenterPoint]);

  return (
    <div
      role="status"
      className={[styles.loader, className].filter(Boolean).join(' ')}
    >
      <span className={styles.label}>Loading</span>
      <svg
        ref={svgRef}
        aria-hidden="true"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.waveform}
      >
        {LINES.map((line) => (
          <path
            key={line}
            d={createPath(line, 0, hasCenterPoint)}
            opacity={showLayering ? 0.15 + (0.85 * line) / (LINE_COUNT - 1) : 1}
          />
        ))}
      </svg>
    </div>
  );
}

export { WaveformLoader };
export type { WaveformLoaderProps };
