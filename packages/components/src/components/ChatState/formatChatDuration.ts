import type { ChatStateTimerPrecision } from './ChatState';

export interface FormatChatDurationOptions {
  /** `tenths` keeps one decimal place on the seconds of durations under an hour. */
  precision?: ChatStateTimerPrecision;
  /**
   * `duration` splits minutes and seconds (`1m 5s`); `seconds` counts whole
   * seconds (`65s`) for compact rows. Both switch to hours and minutes
   * (`1h 2m`) from one hour.
   */
  format?: 'duration' | 'seconds';
}

/**
 * Formats elapsed milliseconds the way chat timers display them, for labels
 * such as "Worked for 12s". Invalid or negative values format as `0s`.
 */
export function formatChatDuration(
  milliseconds: number,
  { precision = 'seconds', format = 'duration' }: FormatChatDurationOptions = {}
) {
  const safeMs = Number.isFinite(milliseconds) ? Math.max(0, milliseconds) : 0;
  const totalSeconds = Math.floor(safeMs / 1_000);
  if (totalSeconds >= 3_600) {
    const hours = Math.floor(totalSeconds / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    return `${hours}h ${minutes}m`;
  }
  if (format === 'seconds') return `${totalSeconds}s`;

  const tenths = Math.floor(safeMs / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds =
    precision === 'tenths'
      ? ((tenths % 600) / 10).toFixed(1)
      : String(Math.floor((tenths % 600) / 10));
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
