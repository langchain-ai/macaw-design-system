import { useCallback, useEffect, useRef } from 'react';

export type ChartLegendActiveSource = 'pointer' | 'focus';

export type ChartLegendItemActiveChangeHandler<T extends { id: string }> = (
  item: T,
  source: ChartLegendActiveSource,
  active: boolean
) => void;

export const useChartLegendActiveItem = <T extends { id: string }>(
  items: readonly T[],
  onActiveItemChange?: (item: T | null) => void,
  disabled = false
) => {
  const pointerItemRef = useRef<T | null>(null);
  const focusItemRef = useRef<T | null>(null);
  const reportedItemIdRef = useRef<string | null>(null);
  // Keep cleanup subscribed to the latest handler without requiring React 19.2.
  const onActiveItemChangeRef = useRef(onActiveItemChange);
  useEffect(() => {
    onActiveItemChangeRef.current = onActiveItemChange;
  }, [onActiveItemChange]);

  const reportActiveItem = useCallback<ChartLegendItemActiveChangeHandler<T>>(
    (item, source, active) => {
      const activeItemRef =
        source === 'pointer' ? pointerItemRef : focusItemRef;

      if (active) activeItemRef.current = item;
      else if (activeItemRef.current?.id === item.id)
        activeItemRef.current = null;

      const activeItem = disabled
        ? null
        : (pointerItemRef.current ?? focusItemRef.current);
      const activeItemId = activeItem?.id ?? null;
      if (reportedItemIdRef.current === activeItemId) return;

      reportedItemIdRef.current = activeItemId;
      onActiveItemChange?.(activeItem);
    },
    [disabled, onActiveItemChange]
  );

  const clearActiveItem = useCallback(() => {
    const hadActiveItem = reportedItemIdRef.current != null;
    pointerItemRef.current = null;
    focusItemRef.current = null;
    reportedItemIdRef.current = null;
    if (hadActiveItem) onActiveItemChangeRef.current?.(null);
  }, []);
  const itemIdsKey = disabled
    ? ''
    : JSON.stringify(items.map((item) => item.id).sort());

  useEffect(() => () => clearActiveItem(), [itemIdsKey, clearActiveItem]);

  return reportActiveItem;
};
