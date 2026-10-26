import { useEffect, useRef } from 'react';

import styles from './WaveformLoader.module.css';

const SPEEDS = { slow: 500, medium: 250, fast: 100 } as const;
const LINE_COUNT = 20;
const SAMPLE_COUNT = 120;
const WIDTH = 1920;
const HEIGHT = 1080;

function createWave(random = false) {
  const frequency = random ? 0.5 + Math.random() * 4 : 2;
  const phase = random ? Math.random() * Math.PI * 2 : 0;

  return Array.from({ length: LINE_COUNT }, (_, line) => {
    const spread = (line / (LINE_COUNT - 1)) * 2 - 1;
    const amplitude = random ? 0.4 + Math.random() * 0.6 : 1;
    const offset = random ? (Math.random() - 0.5) * 0.8 : 0;

    return Array.from({ length: SAMPLE_COUNT + 1 }, (_, sample) => {
      const x = sample / SAMPLE_COUNT;
      const envelope = Math.sin(Math.PI * x) ** 2;
      const wave = Math.sin(x * Math.PI * 2 * frequency + phase + offset);
      return HEIGHT / 2 + envelope * wave * spread * amplitude * HEIGHT * 0.4;
    });
  });
}

function toPath(points: number[]) {
  return points
    .map(
      (y, sample) =>
        `${sample === 0 ? 'M' : 'L'}${(sample / SAMPLE_COUNT) * WIDTH},${y.toFixed(2)}`
    )
    .join(' ');
}

const INITIAL_WAVE = createWave();

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
    let frame: number;
    let current = INITIAL_WAVE;

    const draw = (wave: number[][]) => {
      paths?.forEach((path, line) =>
        path.setAttribute('d', toPath(wave[line]))
      );
    };

    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (preference.matches) {
        current = INITIAL_WAVE;
        draw(current);
        return;
      }

      let from = current;
      let target = createWave(true);
      let started: number | undefined;
      const animate = (time: number) => {
        started ??= time;
        const progress = Math.min((time - started) / duration, 1);
        const eased = progress * progress * (3 - 2 * progress);
        current = from.map((points, line) =>
          points.map((y, sample) => y + (target[line][sample] - y) * eased)
        );
        draw(current);
        if (progress === 1) {
          from = current;
          target = createWave(true);
          started = time;
        }
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
        {INITIAL_WAVE.map((points, line) => (
          <path key={line} d={toPath(points)} />
        ))}
      </svg>
    </div>
  );
}

export { WaveformLoader };
export type { WaveformLoaderProps };
