import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const MINIMUM_LEFT_MARGIN_PX = 100;
export const MINIMUM_PANE_WIDTH_PX = 500;
const KEYBOARD_RESIZE_STEP_PX = 10;
const MAX_INITIAL_PANE_WIDTH_PX = 1280;
const INITIAL_PANE_WIDTH_RATIO = 2 / 3;
export const RESIZE_HANDLE_OUTSET_PX = 8;
export const RESIZE_HANDLE_WIDTH_PX = 20;

const getClientWidth = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined')
    return 0;
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
};

function getAvailableWidth(element?: HTMLDivElement | null) {
  if (typeof document === 'undefined') return 0;
  const style = getComputedStyle(element ?? document.documentElement);
  const reservedRight = Number.parseFloat(
    element ? style.right : style.getPropertyValue('--polly-chat-width')
  );
  return Math.max(0, getClientWidth() - (reservedRight || 0));
}

export function clampLeft(
  value: number,
  width: number,
  minPaneWidthPx: number = MINIMUM_PANE_WIDTH_PX
) {
  const maximumLeft = Math.max(0, width - minPaneWidthPx);
  return Math.min(maximumLeft, Math.max(MINIMUM_LEFT_MARGIN_PX, value));
}

function defaultLeft(
  props: {
    offsetPx: number;
    sidePaneId?: string;
    defaultWidthPx?: number;
    minWidthPx?: number;
  },
  width: number
) {
  if (props.sidePaneId != null && typeof window !== 'undefined') {
    const value = window.localStorage.getItem(
      `SidePanelGroup:sizes:${props.sidePaneId}`
    );
    const pastRatio = Number.parseFloat(value ?? '');

    if (!Number.isNaN(pastRatio)) {
      const desiredWidth = width * pastRatio - props.offsetPx;
      return clampLeft(width - desiredWidth, width, props.minWidthPx);
    }
  }

  const desiredWidth =
    Math.min(
      props.defaultWidthPx ?? MAX_INITIAL_PANE_WIDTH_PX,
      width * INITIAL_PANE_WIDTH_RATIO
    ) - props.offsetPx;

  return clampLeft(width - desiredWidth, width, props.minWidthPx);
}

export function useSplitViewPaneResize(props: {
  offsetPx: number;
  sidePaneId?: string;
  defaultWidthPx?: number;
  overrideWidthPx?: number;
  minWidthPx?: number;
  open: boolean;
}) {
  const target = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    container.current = node;
    setElement(node);
  }, []);

  const resizing = useRef(false);
  const initialProps = useRef(props);
  const [width, setWidth] = useState(0);
  const [left, setLeft] = useState(MINIMUM_LEFT_MARGIN_PX);

  useIsomorphicLayoutEffect(() => {
    const width = getAvailableWidth();
    setWidth(width);
    setLeft(defaultLeft(initialProps.current, width));
  }, []);

  useEffect(() => {
    if (props.overrideWidthPx) {
      const desiredWidth = props.overrideWidthPx - props.offsetPx;

      setLeft(clampLeft(width - desiredWidth, width, props.minWidthPx));
    }
  }, [props.overrideWidthPx, props.offsetPx, props.minWidthPx, width]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    resizing.current = true;
    if (target.current) {
      target.current.dataset.resizeHandleActive = 'true';
    }
  }, []);

  const onMouseUp = useCallback(() => {
    if (resizing.current) {
      resizing.current = false;
      if (target.current) {
        delete target.current.dataset.resizeHandleActive;
      }
    }
  }, []);

  const doResizeBounded = useCallback(
    (desiredX: number) => {
      if (container.current) {
        const width = getAvailableWidth(container.current);
        const bounded = clampLeft(desiredX, width, props.minWidthPx);

        if (props.sidePaneId != null && width > 0) {
          const ratio = (width - bounded) / width;
          window.localStorage.setItem(
            `SidePanelGroup:sizes:${props.sidePaneId}`,
            ratio.toString()
          );
        }

        container.current.style.left = `${bounded}px`;
        if (target.current) {
          target.current.style.left = `${bounded - RESIZE_HANDLE_OUTSET_PX}px`;
          target.current.setAttribute('aria-valuenow', bounded.toString());
        }
        setLeft(bounded);
      }
    },
    [props.sidePaneId, props.minWidthPx]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizing.current && container.current) {
        e.preventDefault();
        doResizeBounded(e.clientX);
      }
    },
    [doResizeBounded]
  );

  const onResize = useCallback(() => {
    setWidth(getAvailableWidth(container.current));
    if (container.current) {
      // Inline position excludes the slide transition's visual transform.
      doResizeBounded(Number.parseFloat(container.current.style.left));
    }
  }, [doResizeBounded]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const desiredLeft =
      e.key === 'ArrowLeft'
        ? left - KEYBOARD_RESIZE_STEP_PX
        : e.key === 'ArrowRight'
          ? left + KEYBOARD_RESIZE_STEP_PX
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? width
              : undefined;
    if (desiredLeft === undefined) return;

    e.preventDefault();
    doResizeBounded(desiredLeft);
  };

  useIsomorphicLayoutEffect(() => {
    if (!element) return;
    onResize();
    const observer = new ResizeObserver(onResize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, onResize]);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [onMouseMove, onMouseUp, onResize]);

  useEffect(() => {
    // A closed pane has no element to resize, so restore valid bounds on reopen.
    if (props.open && left !== clampLeft(left, width, props.minWidthPx)) {
      setLeft(defaultLeft(props, width));
    }
  }, [props, left, width]);

  return {
    left,
    width,
    onMouseDown,
    onKeyDown,
    target,
    container,
    containerRef,
  };
}
