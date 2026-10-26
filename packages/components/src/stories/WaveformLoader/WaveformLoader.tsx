import { useEffect, useState } from 'react';

import { cn } from '../../utils/cn';

import styles from './WaveformLoader.module.css';

const SPEEDS = { slow: 500, medium: 250, fast: 100 } as const;
const LEVELS = [
  1, 0.973, 0.933, 0.887, 0.823, 0.741, 0.631, 0.506, 0.36, 0.186,
];
const LOBES = [
  {
    start: 0.522,
    control1: 194.376,
    control2: 213.2,
    peak: 340.782,
    control3: 450.379,
    control4: 507.349,
    end: 664.702,
    height: 171.537,
  },
  {
    start: 628.607,
    control1: 1005.19,
    control2: 1041.76,
    peak: 1289.61,
    control3: 1502.52,
    control4: 1613.19,
    end: 1918.87,
    height: 371.085,
  },
];

interface WaveformLoaderProps {
  speed?: keyof typeof SPEEDS;
  className?: string;
}

function WaveformLoader({ speed = 'medium', className }: WaveformLoaderProps) {
  const [amplitudes, setAmplitudes] = useState([1, 1]);
  const duration = SPEEDS[speed];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    const updateMotion = () => {
      clearInterval(timer);
      setAmplitudes([1, 1]);
      if (!preference.matches) {
        timer = setInterval(() => {
          setAmplitudes(LOBES.map(() => 0.25 + Math.random() * 0.75));
        }, duration);
      }
    };

    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => {
      clearInterval(timer);
      preference.removeEventListener('change', updateMotion);
    };
  }, [duration]);

  return (
    <div
      role="status"
      className={cn('w-full min-w-0 text-brand-primary', className)}
    >
      <span className="sr-only">Loading</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 1920 1080"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4412"
        strokeLinecap="round"
        className="block h-auto w-full"
      >
        <path d="M1 540.574H1919" />
        {LOBES.map((lobe, index) => (
          <g key={lobe.start} transform="translate(0 540.574)">
            <g
              className={styles.pulse}
              style={{
                transform: `scaleY(${amplitudes[index]})`,
                transitionDuration: `${duration}ms`,
              }}
            >
              {LEVELS.flatMap((level) =>
                [-1, 1].map((direction) => {
                  const height = lobe.height * level * direction;
                  return (
                    <path
                      key={`${level}-${direction}`}
                      d={`M${lobe.start} 0C${lobe.control1} 0 ${lobe.control2} ${height} ${lobe.peak} ${height}C${lobe.control3} ${height} ${lobe.control4} 0 ${lobe.end} 0`}
                    />
                  );
                })
              )}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

export { WaveformLoader };
export type { WaveformLoaderProps };
