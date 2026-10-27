import { useEffect, useRef, type CSSProperties } from 'react';

import { useColorScheme } from '../../hooks/useColorScheme';
import { cn } from '../../utils/cn';
import { Text } from '../Text';

export interface DotLoaderProps {
  width?: number;
  height?: number;
  color?: string;
  mutedColor?: string;
  label?: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

interface DrawOptions {
  color: string;
  mutedColor: string;
  duration: number;
  animate: boolean;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function smootherstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const STRANDS = [
  { amp: 1.0, freq: 1.15, speed: 1, phase: 0.0 },
  { amp: 0.72, freq: 1.6, speed: 2, phase: 1.9 },
  { amp: 0.86, freq: 0.85, speed: 1, phase: 3.6 },
  { amp: 0.5, freq: 2.1, speed: 2, phase: 5.1 },
];

function drawDotLoader(
  ctx: CanvasRenderingContext2D,
  t: number,
  w: number,
  h: number,
  opts: DrawOptions
): void {
  ctx.clearRect(0, 0, w, h);

  const pitch = 4;
  const cols = Math.max(8, Math.round(w / pitch));
  const cy = h / 2;
  const maxAmp = h / 2 - 2;
  const cRes = hexToRgb(opts.color);
  const cMut = hexToRgb(opts.mutedColor);
  const loop = opts.animate ? t / opts.duration : 0;

  for (let c = 0; c < cols; c++) {
    const u = (c + 0.5) / cols;
    const x = u * w;

    const env = 1 - smootherstep(0.04, 0.86, u);
    const resolved = 1 - env;
    const edge = smoothstep(0, 0.12, u) * (1 - smoothstep(0.9, 1, u));
    if (edge <= 0.002) continue;

    const cr = Math.round(cMut[0] + (cRes[0] - cMut[0]) * resolved);
    const cg = Math.round(cMut[1] + (cRes[1] - cMut[1]) * resolved);
    const cb = Math.round(cMut[2] + (cRes[2] - cMut[2]) * resolved);
    const r = 0.85 + 0.2 * resolved;

    STRANDS.forEach((s, j) => {
      const theta = Math.PI * 2 * (s.freq * u - s.speed * loop) + s.phase;
      const y = cy + Math.sin(theta) * maxAmp * s.amp * env;

      const merge = j === 0 ? 1 : 1 - smoothstep(0.35, 0.9, resolved);
      const alpha = edge * (0.3 + 0.7 * resolved) * merge;
      if (alpha <= 0.002) return;
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

export function DotLoader({
  width = 200,
  height = 48,
  color,
  mutedColor,
  label,
  duration = 6,
  className,
  style,
}: DotLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const mutedRef = useRef<HTMLSpanElement>(null);
  const { resolvedMode, isDarkMode } = useColorScheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !accentRef.current || !mutedRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sample = document.createElement('canvas');
    sample.width = sample.height = 1;
    const sampleContext = sample.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return;
    const resolveColor = (value: string) => {
      sampleContext.clearRect(0, 0, 1, 1);
      sampleContext.fillStyle = value;
      sampleContext.fillRect(0, 0, 1, 1);
      return (
        '#' +
        Array.from(sampleContext.getImageData(0, 0, 1, 1).data)
          .slice(0, 3)
          .map((channel) => channel.toString(16).padStart(2, '0'))
          .join('')
      );
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const opts: DrawOptions = {
      color: resolveColor(getComputedStyle(accentRef.current).color),
      mutedColor: resolveColor(getComputedStyle(mutedRef.current).color),
      duration: Number.isFinite(duration) && duration > 0 ? duration : 6,
      animate: !media.matches,
    };
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      drawDotLoader(ctx, (now - start) / 1000, width, height, opts);
      raf = requestAnimationFrame(frame);
    };
    const updateMotion = () => {
      cancelAnimationFrame(raf);
      opts.animate = !media.matches;
      drawDotLoader(ctx, 0, width, height, opts);
      if (opts.animate) raf = requestAnimationFrame(frame);
    };
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => {
      cancelAnimationFrame(raf);
      media.removeEventListener('change', updateMotion);
    };
  }, [width, height, color, mutedColor, duration, resolvedMode]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? 'Loading'}
      className={cn('inline-flex flex-col items-center gap-space-2', className)}
      style={style}
    >
      <span
        ref={accentRef}
        style={{ color }}
        aria-hidden="true"
        className={cn(
          'hidden',
          isDarkMode ? 'text-icon-brand-background' : 'text-icon-brand'
        )}
      />
      <span
        ref={mutedRef}
        style={{ color: mutedColor }}
        aria-hidden="true"
        className={cn('hidden', isDarkMode ? 'text-primary' : 'text-secondary')}
      />
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width, height }}
        aria-hidden="true"
      />
      {label ? (
        <Text variant="xs" className="text-secondary">
          {label}
        </Text>
      ) : null}
    </div>
  );
}
