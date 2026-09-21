/** Constrains `value` to the inclusive `[minimum, maximum]` range. */
export const clamp = (
  value: number,
  minimum: number,
  maximum: number
): number => Math.min(maximum, Math.max(minimum, value));
