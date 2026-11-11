import { useEffect, useRef, useState } from 'react';

import { Text } from '../Text';
import type { ChatStateTimerPrecision } from './ChatState';
import { formatChatDuration } from './formatChatDuration';

interface ChatStateTimerProps {
  visible: boolean;
  elapsedMs?: number;
  /** Wall-clock start (epoch milliseconds) that replaces the mount-time clock. */
  startedAt?: number;
  precision: ChatStateTimerPrecision;
  format?: 'duration' | 'seconds';
  running: boolean;
}

/** Owns clock updates so status labels are not rerendered by timer ticks. */
export function ChatStateTimer({
  visible,
  elapsedMs,
  startedAt: hostStartedAt,
  precision,
  format = 'duration',
  running,
}: ChatStateTimerProps) {
  const startedAt = useRef<number | null>(null);
  const stoppedAt = useRef<number | null>(null);
  const wallStoppedAt = useRef<number | null>(null);
  const hasRun = useRef(false);
  const [measuredMs, setMeasuredMs] = useState(0);
  const controlled = elapsedMs !== undefined;
  const intervalMs = precision === 'tenths' ? 100 : 1_000;

  useEffect(() => {
    if (running) {
      hasRun.current = true;
      wallStoppedAt.current = null;
      const now = performance.now();
      if (startedAt.current === null) {
        startedAt.current = now;
      } else if (stoppedAt.current !== null) {
        startedAt.current += now - stoppedAt.current;
      }
      stoppedAt.current = null;
    } else {
      if (startedAt.current !== null) stoppedAt.current ??= performance.now();
      if (hasRun.current) wallStoppedAt.current ??= Date.now();
    }
    if (controlled) return;

    let tick: () => void;
    if (hostStartedAt !== undefined) {
      // A host start time counts the whole operation, including time spent
      // before this timer mounted, such as across a page or thread handover.
      if (!hasRun.current) return;
      tick = () =>
        setMeasuredMs((wallStoppedAt.current ?? Date.now()) - hostStartedAt);
    } else {
      const start = startedAt.current;
      if (start === null) return;
      // Measure wall time so delayed callbacks and hidden tabs do not lose elapsed time.
      tick = () =>
        setMeasuredMs((stoppedAt.current ?? performance.now()) - start);
    }
    if (!running) {
      tick();
      return;
    }
    if (!visible) return;
    tick();
    const interval = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(interval);
  }, [controlled, hostStartedAt, intervalMs, running, visible]);

  if (!visible) return null;

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
      {formatChatDuration(elapsedMs ?? measuredMs, { precision, format })}
    </Text>
  );
}
