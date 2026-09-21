import { useEffect, useRef, useState } from 'react';

import { Text } from '../Text';

interface ThinkingStateTimerProps {
  visible: boolean;
  elapsedMs?: number;
  precision: 'seconds' | 'tenths';
  size: 'sm' | 'md' | 'lg';
}

/** Keeps clock updates local to the timer, without rerendering the label or grid. */
export function ThinkingStateTimer({
  visible,
  elapsedMs,
  precision,
  size,
}: ThinkingStateTimerProps) {
  const startedAt = useRef<number | null>(null);
  const [measuredMs, setMeasuredMs] = useState(0);
  const controlled = elapsedMs !== undefined;
  const intervalMs = precision === 'tenths' ? 100 : 1_000;

  useEffect(() => {
    startedAt.current ??= performance.now();
    const start = startedAt.current;
    if (!visible || controlled) return;

    // Measure time so hidden tabs and delayed callbacks do not lose elapsed time.
    const tick = () => setMeasuredMs(performance.now() - start);
    tick();
    const interval = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(interval);
  }, [controlled, intervalMs, visible]);

  if (!visible) return null;

  const value = elapsedMs ?? measuredMs;
  const safeMs = Number.isFinite(value) ? Math.max(0, value) : 0;
  const tenths = Math.floor(safeMs / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds =
    precision === 'tenths'
      ? ((tenths % 600) / 10).toFixed(1)
      : String(Math.floor((tenths % 600) / 10));

  return (
    <Text
      as="span"
      variant={size === 'sm' ? 'xs' : 'sm'}
      color="tertiary"
      role="timer"
      aria-label="Elapsed time"
      aria-live="off"
      className="shrink-0 whitespace-nowrap font-mono tabular-nums leading-4"
    >
      {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
    </Text>
  );
}
