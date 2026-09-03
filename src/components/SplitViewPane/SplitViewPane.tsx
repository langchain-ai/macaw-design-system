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

const MAX_INITIAL_PANE_WIDTH_PX = 1280;
const INITIAL_PANE_WIDTH_RATIO = 2 / 3;

type OpenSplitViewPane = {
  id: string;
  zIndex: number;
  order: number;
  onEscape: (event: KeyboardEvent) => void;
};

const openSplitViewPanes = new Map<string, OpenSplitViewPane>();
let nextOpenPaneOrder = 0;

function handleEscapeKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;

  queueMicrotask(() => {
    if (event.defaultPrevented) return;

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

    topmostPane?.onEscape(event);
  });
}

function registerOpenPane(
  id: string,
  zIndex: number,
  onEscape: (event: KeyboardEvent) => void
) {
  openSplitViewPanes.set(id, {
    id,
    zIndex,
    order: nextOpenPaneOrder++,
    onEscape,
  });

  if (openSplitViewPanes.size === 1) {
    document.addEventListener('keydown', handleEscapeKeyDown);
  }

  return () => {
    openSplitViewPanes.delete(id);
    if (openSplitViewPanes.size === 0) {
      document.removeEventListener('keydown', handleEscapeKeyDown);
    }
  };
}

const getClientWidth = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 0;
  }

  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
};

function clampLeft(
  value: number,
  minPaneWidthPx: number = MINIMUM_PANE_WIDTH_PX
) {
  const clientWidth = getClientWidth();
  return Math.max(
    MINIMUM_LEFT_MARGIN_PX,
    Math.min(clientWidth - minPaneWidthPx, value)
  );
}

function defaultLeft(props: {
  offsetPx: number;
  sidePaneId?: string;
  defaultWidthPx?: number;
  minWidthPx?: number;
}) {
  const clientWidth = getClientWidth();
  if (props.sidePaneId != null && typeof window !== 'undefined') {
    const value = window.localStorage.getItem(
      `SidePanelGroup:sizes:${props.sidePaneId}`
    );
    const pastRatio = Number.parseFloat(value ?? '');

    if (!Number.isNaN(pastRatio)) {
      const desiredWidth = clientWidth * pastRatio - props.offsetPx;
      return clampLeft(clientWidth - desiredWidth, props.minWidthPx);
    }
  }

  const desiredWidth =
    Math.min(
      props.defaultWidthPx ?? MAX_INITIAL_PANE_WIDTH_PX,
      clientWidth * INITIAL_PANE_WIDTH_RATIO
    ) - props.offsetPx;

  return clampLeft(clientWidth - desiredWidth, props.minWidthPx);
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
  const initialProps = useRef(props);

  const resizing = useRef(false);
  const [left, setLeft] = useState(MINIMUM_LEFT_MARGIN_PX);

  useIsomorphicLayoutEffect(() => {
    setLeft(defaultLeft(initialProps.current));
  }, []);

  useEffect(() => {
    const clientWidth = getClientWidth();
    if (props.overrideWidthPx) {
      const desiredWidth = props.overrideWidthPx - props.offsetPx;

      setLeft(clampLeft(clientWidth - desiredWidth, props.minWidthPx));
    }
  }, [props.overrideWidthPx, props.offsetPx, props.minWidthPx]);

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
      if (container.current) {
        setLeft(container.current?.getBoundingClientRect().left);
      }
    }
  }, []);

  const doResizeBounded = useCallback(
    (desiredX: number) => {
      if (container.current) {
        const bounded = clampLeft(desiredX, props.minWidthPx);

        if (props.sidePaneId != null) {
          const clientWidth = getClientWidth();
          const ratio = (clientWidth - bounded) / clientWidth;
          window.localStorage.setItem(
            `SidePanelGroup:sizes:${props.sidePaneId}`,
            ratio.toString()
          );
        }

        container.current.style.left = `${bounded}px`;
        return bounded;
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
    if (container.current) {
      const bounded = doResizeBounded(
        container.current.getBoundingClientRect().left
      );
      if (bounded) {
        setLeft(bounded);
      }
    }
  }, [doResizeBounded]);

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
    // This is for when the pane is opened and the left position is greater than the minimum pane width
    // it resolves a bug when you resize window from large to small while the pane is closed, it might never open again.
    if (
      props.open &&
      left > getClientWidth() - (props.minWidthPx ?? MINIMUM_PANE_WIDTH_PX)
    ) {
      setLeft(defaultLeft(props));
    }
  }, [props, left]);

  return { left, onMouseDown, target, container };
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
  scrollContainer = 'outer',
  headerClassName,
}: SplitViewPaneProps) {
  const depth = useContext(PaneDepth);
  const showChildren = useShowChildren({ children, open });
  const { left, onMouseDown, target, container } = useResize({
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
    return registerOpenPane(paneId, paneZIndex, (event) =>
      handleCloseClickRef.current(event)
    );
  }, [open, paneId, paneZIndex]);

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
              <TransitionChild
                as={Fragment}
                enter="duration-normal motion-reduce:duration-0"
                enterFrom="opacity-0"
                enterTo="animate-slide-left opacity-100 motion-reduce:animate-none"
                leave="duration-normal motion-reduce:duration-0"
                leaveFrom="opacity-100"
                leaveTo="animate-slide-right opacity-0 motion-reduce:animate-none"
              >
                <div
                  ref={container}
                  style={{ left, right: `var(--polly-chat-width, 0px)` }}
                  className={cn(
                    'fixed inset-0 shadow-lg',
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
                    <div
                      ref={target}
                      className={cn(
                        'w-space-4 absolute bottom-0 left-0 top-0 flex cursor-col-resize flex-col justify-center border-l border-subtle transition-all duration-normal hover:border-l-2 data-[resize-handle-active]:border-l-brand motion-reduce:transition-none'
                      )}
                      style={{ zIndex: zIndices.resizeHandle }}
                      onMouseDown={onMouseDown}
                    />
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
