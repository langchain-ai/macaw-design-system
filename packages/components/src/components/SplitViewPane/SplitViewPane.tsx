import type { ReactNode } from 'react';
import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useHotkeys } from 'react-hotkeys-hook';

import { Transition, TransitionChild } from '@headlessui/react';
import * as Portal from '@radix-ui/react-portal';

import { cn } from '../../utils/cn';
import { useZIndex } from '../../utils/useZIndex';
import { ZIndexProvider } from '../../utils/ZIndexContext';
import zIndices from '../../utils/zIndices';
import { createPortalSlot } from '../PortalSlot';
import UnsavedChangesDialog from '../UnsavedChangesDialog';
import { registerOpenPane } from './openPaneRegistry';
import {
  HeaderTitleActionSlot,
  SplitViewPaneHeader,
} from './SplitViewPaneHeader';

export { HeaderTitleActionSlot } from './SplitViewPaneHeader';

const PaneDepth = createContext<number>(0);

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const MINIMUM_LEFT_MARGIN_PX = 100;
const MINIMUM_PANE_WIDTH_PX = 500;
const KEYBOARD_RESIZE_STEP_PX = 10;

const MAX_INITIAL_PANE_WIDTH_PX = 1280;
const INITIAL_PANE_WIDTH_RATIO = 2 / 3;

const RESIZE_HANDLE_OUTSET_PX = 8;
const RESIZE_HANDLE_WIDTH_PX = 20;

const PANE_TRANSITION_CLASSES = {
  enter: 'duration-normal motion-reduce:duration-0',
  enterFrom: 'opacity-0',
  enterTo: 'animate-slide-left opacity-100 motion-reduce:animate-none',
  leave: 'duration-normal motion-reduce:duration-0',
  leaveFrom: 'opacity-100',
  leaveTo: 'animate-slide-right opacity-0 motion-reduce:animate-none',
};
const getClientWidth = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 0;
  }

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

function clampLeft(
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

function useShowChildren({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [showChildren, setShowChildren] = useState<ReactNode>(children);
  useIsomorphicLayoutEffect(() => {
    if (open) setShowChildren(children);
  }, [open, children]);
  return showChildren;
}

function useResize(props: {
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

export const CustomHeaderSlot = createPortalSlot();

export type SplitViewPaneProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  sidePaneId?: string;
  hideArrows?: boolean;
  customHeader?: ReactNode;
  defaultWidthPx?: number;
  overrideWidthPx?: number;
  minWidthPx?: number;
  useCustomHeaderSlot?: boolean;
  requireConfirmationOnClose?: boolean;
  dismissOnOutsideClick?: boolean;
  scrollContainer?: 'outer' | 'inner';
  headerClassName?: string;
} & (
  | {
      title?: undefined;
      onClose?: undefined;
      onExpand?: undefined;
      onNext?: undefined;
      onPrevious?: undefined;
    }
  | {
      title?: ReactNode;
      onClose: () => void;
      onExpand?: (e: React.MouseEvent<HTMLButtonElement>) => void;
      onNext?: () => void;
      onPrevious?: () => void;
    }
);

export function SplitViewPane({
  open,
  onClose,
  onExpand,
  onNext,
  onPrevious,
  children,
  title,
  className,
  sidePaneId,
  hideArrows,
  customHeader,
  useCustomHeaderSlot,
  defaultWidthPx,
  overrideWidthPx,
  minWidthPx,
  requireConfirmationOnClose = false,
  dismissOnOutsideClick = false,
  scrollContainer = 'outer',
  headerClassName,
}: SplitViewPaneProps) {
  const depth = useContext(PaneDepth);
  const showChildren = useShowChildren({ children, open });
  const {
    left,
    width,
    onMouseDown,
    onKeyDown,
    target,
    container,
    containerRef,
  } = useResize({
    offsetPx: depth * 4.5 * 16,
    sidePaneId,
    defaultWidthPx,
    overrideWidthPx,
    minWidthPx,
    open,
  });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const paneZIndex = useZIndex(zIndices.pane);
  const paneId = useId();
  const titleId =
    title && !customHeader && !useCustomHeaderSlot
      ? `${paneId}-title`
      : undefined;
  const maximumLeft = Math.max(
    0,
    width - (minWidthPx ?? MINIMUM_PANE_WIDTH_PX)
  );
  const minimumLeft = Math.min(MINIMUM_LEFT_MARGIN_PX, maximumLeft);

  const handleCloseClick = useCallback(
    (e?: Event) => {
      if (requireConfirmationOnClose) {
        e?.preventDefault();
        e?.stopPropagation();
        setShowConfirmModal(true);
      } else {
        onCloseRef.current?.();
      }
    },
    [requireConfirmationOnClose]
  );

  const handleCloseClickRef = useRef(handleCloseClick);
  handleCloseClickRef.current = handleCloseClick;

  useEffect(() => {
    if (!open) return;
    return registerOpenPane(
      paneId,
      paneZIndex,
      container,
      (event) => handleCloseClickRef.current(event),
      dismissOnOutsideClick
        ? (event) => handleCloseClickRef.current(event)
        : undefined
    );
  }, [container, dismissOnOutsideClick, open, paneId, paneZIndex]);

  const nextRef = useRef(onNext);
  nextRef.current = onNext;

  const prevRef = useRef(onPrevious);
  prevRef.current = onPrevious;

  useHotkeys(
    'j',
    () => {
      nextRef.current?.();
    },
    { enabled: open && onNext != null }
  );

  useHotkeys(
    'k',
    () => {
      prevRef.current?.();
    },
    { enabled: open && onPrevious != null }
  );

  const renderHeader = () => {
    if (customHeader) {
      return customHeader;
    }
    if (useCustomHeaderSlot) {
      return <CustomHeaderSlot.Slot />;
    }

    return (
      <SplitViewPaneHeader
        title={title}
        open={open}
        onClose={handleCloseClick}
        onExpand={onExpand}
        onNext={onNext}
        onPrevious={onPrevious}
        hideArrows={hideArrows}
        headerClassName={headerClassName}
        titleId={titleId}
      />
    );
  };

  return (
    <CustomHeaderSlot.Context>
      <HeaderTitleActionSlot.Context>
        <Portal.Root>
          <Transition show={open} as={Fragment}>
            <div className="relative" style={{ zIndex: paneZIndex }}>
              <TransitionChild as={Fragment} {...PANE_TRANSITION_CLASSES}>
                <div
                  ref={containerRef}
                  style={{ left, right: `var(--polly-chat-width, 0px)` }}
                  className={cn(
                    'fixed inset-0 shadow-lg',
                    !open && 'pointer-events-none',
                    scrollContainer === 'outer'
                      ? 'overflow-y-auto overscroll-y-none'
                      : 'overflow-hidden'
                  )}
                  data-testid="split-view-pane"
                  role={titleId ? 'region' : undefined}
                  aria-labelledby={titleId}
                >
                  <div
                    className={cn(
                      'relative flex flex-col items-stretch bg-elevated',
                      scrollContainer === 'outer' ? 'min-h-full' : 'h-full'
                    )}
                  >
                    <ZIndexProvider value={paneZIndex}>
                      {renderHeader()}
                      <PaneDepth.Provider value={depth + 1}>
                        <div
                          className={cn(
                            'flex flex-1 flex-col',
                            scrollContainer === 'inner' &&
                              'min-h-0 overflow-y-auto overscroll-y-none',
                            className
                          )}
                        >
                          {showChildren}
                        </div>
                      </PaneDepth.Provider>
                    </ZIndexProvider>
                  </div>
                </div>
              </TransitionChild>
              <TransitionChild as={Fragment} {...PANE_TRANSITION_CLASSES}>
                <div
                  ref={target}
                  role="separator"
                  aria-label="Resize pane"
                  aria-orientation="vertical"
                  aria-valuemin={minimumLeft}
                  aria-valuemax={maximumLeft}
                  aria-valuenow={left}
                  tabIndex={0}
                  data-split-view-pane-resize-handle
                  data-testid="split-view-pane-resize-handle"
                  className={cn(
                    'group fixed inset-y-0 cursor-col-resize focus-visible:outline-none',
                    !open && 'pointer-events-none'
                  )}
                  style={{
                    left: left - RESIZE_HANDLE_OUTSET_PX,
                    width: RESIZE_HANDLE_WIDTH_PX,
                    zIndex: zIndices.resizeHandle,
                  }}
                  onMouseDown={onMouseDown}
                  onKeyDown={onKeyDown}
                >
                  <div
                    className="absolute inset-y-0 w-0 border-l border-subtle transition-all duration-normal group-hover:border-l-2 group-focus-visible:border-l-2 group-focus-visible:border-l-brand group-data-[resize-handle-active]:border-l-brand motion-reduce:transition-none"
                    style={{ left: RESIZE_HANDLE_OUTSET_PX }}
                  />
                </div>
              </TransitionChild>
            </div>
          </Transition>
        </Portal.Root>
        <UnsavedChangesDialog
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onDiscard={() => {
            setShowConfirmModal(false);
            onCloseRef.current?.();
          }}
          title="Unsaved Changes"
          description="You may have unsaved changes. Are you sure you want to exit?"
          discardCopy="Exit"
        />
      </HeaderTitleActionSlot.Context>
    </CustomHeaderSlot.Context>
  );
}
