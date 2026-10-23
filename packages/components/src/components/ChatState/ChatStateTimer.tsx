import { useEffect, useRef, useState } from 'react';

import { Text } from '../Text';
import type { ThinkingStateProps } from '../ThinkingState';

interface ChatStateTimerProps {
  visible: boolean;
  elapsedMs?: number;
  precision: NonNullable<ThinkingStateProps['timerPrecision']>;
  format?: 'duration' | 'seconds';
  running: boolean;
}

/** Owns clock updates so status labels are not rerendered by timer ticks. */
export function ChatStateTimer({
  visible,
  elapsedMs,
  precision,
  format = 'duration',
  running,
}: ChatStateTimerProps) {
  const startedAt = useRef<number | null>(null);
  const stoppedAt = useRef<number | null>(null);
  const [measuredMs, setMeasuredMs] = useState(0);
  const controlled = elapsedMs !== undefined;
  const intervalMs = precision === 'tenths' ? 100 : 1_000;

  useEffect(() => {
    if (running) {
      const now = performance.now();
      if (startedAt.current === null) {
        startedAt.current = now;
      } else if (stoppedAt.current !== null) {
        startedAt.current += now - stoppedAt.current;
      }
      stoppedAt.current = null;
    } else if (startedAt.current !== null) {
      stoppedAt.current ??= performance.now();
    }
    if (controlled) return;
    const start = startedAt.current;
    if (start === null) return;

    // Measure wall time so delayed callbacks and hidden tabs do not lose elapsed time.
    const tick = () =>
      setMeasuredMs((stoppedAt.current ?? performance.now()) - start);
    if (!running) {
      tick();
      return;
    }
    if (!visible) return;
    tick();
    const interval = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(interval);
  }, [controlled, intervalMs, running, visible]);

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
      variant="xs"
      color="tertiary"
      role="timer"
      aria-label="Elapsed time"
      aria-live="off"
      className="inline-flex shrink-0 items-center whitespace-nowrap tabular-nums leading-4 tracking-normal"
    >
      {format === 'seconds'
        ? `${Math.floor(safeMs / 1_000)}s`
        : minutes > 0
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`}
    </Text>
  );
}
