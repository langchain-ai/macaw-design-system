import type { RefObject } from 'react';

type OpenSplitViewPane = {
  id: string;
  zIndex: number;
  order: number;
  element: RefObject<HTMLDivElement | null>;
  onEscape: (event: KeyboardEvent) => void;
  onMouseDownOutside?: (event: MouseEvent) => void;
};

const openSplitViewPanes = new Map<string, OpenSplitViewPane>();
let nextOpenPaneOrder = 0;

function getTopmostPane() {
  let topmostPane: OpenSplitViewPane | undefined;
  for (const pane of openSplitViewPanes.values()) {
    if (
      !topmostPane ||
      pane.zIndex > topmostPane.zIndex ||
      (pane.zIndex === topmostPane.zIndex && pane.order > topmostPane.order)
    ) {
      topmostPane = pane;
    }
  }
  return topmostPane;
}

function handleEscapeKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;

  queueMicrotask(() => {
    if (event.defaultPrevented) return;
    getTopmostPane()?.onEscape(event);
  });
}

function handleMouseDown(event: MouseEvent) {
  const topmostPane = getTopmostPane();
  const path = event.composedPath();
  if (
    topmostPane?.onMouseDownOutside == null ||
    document.querySelector(
      '[data-pane-interaction-boundary][data-state="open"]'
    ) != null ||
    path.some(
      (target) =>
        target instanceof HTMLElement &&
        (target.classList.contains('data-grid-row-component') ||
          target.hasAttribute('data-split-view-pane-interaction-boundary') ||
          target.hasAttribute('data-split-view-pane-resize-handle'))
    )
  ) {
    return;
  }

  const element = topmostPane.element.current;
  // The bounds comparison below misses clicks on the pane's own subpixel edge,
  // so containment decides first.
  if (element == null || path.includes(element)) return;
  const bounds = element.getBoundingClientRect();
  const isInside =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom;
  if (!isInside) topmostPane.onMouseDownOutside(event);
}

export function registerOpenPane(
  id: string,
  zIndex: number,
  element: RefObject<HTMLDivElement | null>,
  onEscape: (event: KeyboardEvent) => void,
  onMouseDownOutside?: (event: MouseEvent) => void
) {
  openSplitViewPanes.set(id, {
    id,
    zIndex,
    order: nextOpenPaneOrder++,
    element,
    onEscape,
    onMouseDownOutside,
  });

  if (openSplitViewPanes.size === 1) {
    document.addEventListener('keydown', handleEscapeKeyDown);
    document.addEventListener('mousedown', handleMouseDown, true);
  }

  return () => {
    openSplitViewPanes.delete(id);
    if (openSplitViewPanes.size === 0) {
      document.removeEventListener('keydown', handleEscapeKeyDown);
      document.removeEventListener('mousedown', handleMouseDown, true);
    }
  };
}
