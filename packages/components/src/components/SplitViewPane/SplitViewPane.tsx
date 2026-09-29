import type { ReactNode } from 'react';
import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
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
import { useShowChildren } from './useShowChildren';
import {
  MINIMUM_LEFT_MARGIN_PX,
  MINIMUM_PANE_WIDTH_PX,
  RESIZE_HANDLE_OUTSET_PX,
  RESIZE_HANDLE_WIDTH_PX,
  useSplitViewPaneResize,
} from './useSplitViewPaneResize';

export { HeaderTitleActionSlot } from './SplitViewPaneHeader';

const PaneDepth = createContext<number>(0);

const PANE_TRANSITION_CLASSES = {
  enter: 'duration-normal motion-reduce:duration-0',
  enterFrom: 'opacity-0',
  enterTo: 'animate-slide-left opacity-100 motion-reduce:animate-none',
  leave: 'duration-normal motion-reduce:duration-0',
  leaveFrom: 'opacity-100',
  leaveTo: 'animate-slide-right opacity-0 motion-reduce:animate-none',
};

export const CustomHeaderSlot = createPortalSlot();

function PaneShell({
  children,
  showConfirmModal,
  onDismissConfirm,
  onDiscard,
}: {
  children: ReactNode;
  showConfirmModal: boolean;
  onDismissConfirm: () => void;
  onDiscard: () => void;
}) {
  return (
    <CustomHeaderSlot.Context>
      <HeaderTitleActionSlot.Context>
        {children}
        <UnsavedChangesDialog
          isOpen={showConfirmModal}
          onClose={onDismissConfirm}
          onDiscard={onDiscard}
          title="Unsaved Changes"
          description="You may have unsaved changes. Are you sure you want to exit?"
          discardCopy="Exit"
        />
      </HeaderTitleActionSlot.Context>
    </CustomHeaderSlot.Context>
  );
}

function PaneBody({
  paneZIndex,
  depth,
  header,
  className,
  children,
}: {
  paneZIndex: number;
  depth: number;
  header: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ZIndexProvider value={paneZIndex}>
      {header}
      <PaneDepth.Provider value={depth + 1}>
        <div className={cn('flex flex-1 flex-col', className)}>{children}</div>
      </PaneDepth.Provider>
    </ZIndexProvider>
  );
}

export type SplitViewPaneProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  variant?: 'overlay' | 'inline';
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
  variant = 'overlay',
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
  const inline = variant === 'inline';
  const {
    left,
    width,
    onMouseDown,
    onKeyDown,
    target,
    container,
    containerRef,
  } = useSplitViewPaneResize({
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
    // Only overlay panes join the registry. An inline pane can outlive every
    // overlay on the page, and as the topmost entry it would swallow Escape
    // and block outside-click dismissal for the overlay panes above it.
    if (!open || inline) return;
    return registerOpenPane(
      paneId,
      paneZIndex,
      container,
      (event) => handleCloseClickRef.current(event),
      dismissOnOutsideClick
        ? (event) => handleCloseClickRef.current(event)
        : undefined
    );
  }, [container, dismissOnOutsideClick, inline, open, paneId, paneZIndex]);

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
    // SplitViewPaneHeader always draws a close button and the arrows, so a pane
    // with no header content of its own would get a stray control bar.
    if (title == null && onClose == null) {
      return null;
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

  const dismissConfirm = () => setShowConfirmModal(false);
  const discardAndClose = () => {
    setShowConfirmModal(false);
    onCloseRef.current?.();
  };

  return (
    <PaneShell
      showConfirmModal={showConfirmModal}
      onDismissConfirm={dismissConfirm}
      onDiscard={discardAndClose}
    >
      {inline ? (
        // An inline pane keeps its children mounted so collapsing can animate;
        // an overlay pane unmounts them on close via useShowChildren.
        <div
          inert={!open}
          className={cn(
            'grid shrink-0 transition-[grid-template-columns] duration-normal ease-out motion-reduce:transition-none',
            open ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
          )}
          data-testid="split-view-pane"
          role={titleId ? 'region' : undefined}
          aria-labelledby={titleId}
        >
          <div className="flex min-w-0 flex-col overflow-y-auto overflow-x-hidden">
            <PaneBody
              paneZIndex={paneZIndex}
              depth={depth}
              header={renderHeader()}
              className={className}
            >
              {children}
            </PaneBody>
          </div>
        </div>
      ) : (
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
                    <PaneBody
                      paneZIndex={paneZIndex}
                      depth={depth}
                      header={renderHeader()}
                      className={cn(
                        scrollContainer === 'inner' &&
                          'min-h-0 overflow-y-auto overscroll-y-none',
                        className
                      )}
                    >
                      {showChildren}
                    </PaneBody>
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
      )}
    </PaneShell>
  );
}
