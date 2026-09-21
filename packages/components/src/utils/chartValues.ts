export const getNearestChartValue = <Value>(
  values: readonly Value[],
  targetPosition: number,
  getPosition: (value: Value) => number | undefined
): Value | null => {
  let nearest: Value | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const value of values) {
    const position = getPosition(value);
    if (position == null) continue;
    const distance = Math.abs(position - targetPosition);
    if (distance < nearestDistance) {
      nearest = value;
      nearestDistance = distance;
    }
  }

  return nearest;
};

export const getChartTickValues = <Value>(
  values: readonly Value[],
  maximumTickCount: number
): Value[] => {
  if (values.length === 0) return [];

  const finiteMaximum = Number.isFinite(maximumTickCount)
    ? Math.floor(maximumTickCount)
    : 1;
  const tickCount = Math.max(1, Math.min(values.length, finiteMaximum));
  if (tickCount === values.length) return Array.from(values);
  if (tickCount === 1) {
    const firstValue = values[0];
    return firstValue == null ? [] : [firstValue];
  }

  const ticks: Value[] = [];
  const maximumIndex = values.length - 1;
  for (let index = 0; index < tickCount; index += 1) {
    const valueIndex = Math.round((index * maximumIndex) / (tickCount - 1));
    const value = values[valueIndex];
    if (value != null && ticks.at(-1) !== value) ticks.push(value);
  }
  return ticks;
};
