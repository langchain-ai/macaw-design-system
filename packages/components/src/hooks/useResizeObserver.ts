import { useCallback, useRef, type RefCallback } from 'react';

export const useResizeObserver = <T extends HTMLElement>(
  onResize: (entries: ResizeObserverEntry[]) => void
): RefCallback<T> => {
  const resizeRef = useRef(onResize);
  resizeRef.current = onResize;

  // A callback ref rather than a mount effect, so an element that first renders
  // after the component (e.g. behind a loading state) is still observed.
  return useCallback((element: T | null) => {
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      resizeRef.current(entries);
    });

    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
      resizeRef.current([]);
    };
  }, []);
};
