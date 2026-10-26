import { useEffect, useRef } from 'react';

import styles from './WaveformLoader.module.css';

const SPEEDS = { slow: 500, medium: 250, fast: 100 } as const;
const LINE_COUNT = 20;
const SAMPLE_COUNT = 120;
const WIDTH = 1920;
const HEIGHT = 1080;

function createPath(line: number, time = 0) {
  const phase = line * 2.4;
  const spread = (line / (LINE_COUNT - 1)) * 2 - 1;
  const frequency = 2 + Math.sin(time * 0.17 + phase) * 1.4;
  const amplitude = 0.65 + Math.sin(time * 0.31 + phase) * 0.25;

  return Array.from({ length: SAMPLE_COUNT + 1 }, (_, sample) => {
    const x = sample / SAMPLE_COUNT;
    const envelope = Math.sin(Math.PI * x) ** 2;
    const wave = Math.sin(x * Math.PI * 2 * frequency + time * 0.7 + phase);
    const y = HEIGHT / 2 + envelope * wave * spread * amplitude * HEIGHT * 0.4;
    return `${sample === 0 ? 'M' : 'L'}${x * WIDTH},${y.toFixed(2)}`;
  }).join(' ');
}

const INITIAL_PATHS = Array.from({ length: LINE_COUNT }, (_, line) =>
  createPath(line)
);

interface WaveformLoaderProps {
  speed?: keyof typeof SPEEDS;
  className?: string;
}

function WaveformLoader({ speed = 'medium', className }: WaveformLoaderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const duration = SPEEDS[speed];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const paths = svgRef.current?.querySelectorAll('path');
    const rates = INITIAL_PATHS.map(() => 0.5 + Math.random());
    let frame: number;

    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (preference.matches) {
        paths?.forEach((path, line) =>
          path.setAttribute('d', INITIAL_PATHS[line])
        );
        return;
      }

      let started: number | undefined;
      const animate = (time: number) => {
        started ??= time;
        const elapsed = (time - started) / duration;
        paths?.forEach((path, line) => {
          path.setAttribute('d', createPath(line, elapsed * rates[line]));
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
  }, [duration]);

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
        {INITIAL_PATHS.map((path, line) => (
          <path key={line} d={path} />
        ))}
      </svg>
    </div>
  );
}

export { WaveformLoader };
export type { WaveformLoaderProps };
