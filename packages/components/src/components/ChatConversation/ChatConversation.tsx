import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';

import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/merge-refs';
import { Button } from '../Button';

/** Distance from the bottom, in px, that still counts as reading the latest output. */
const FOLLOW_THRESHOLD = 48;

export interface ChatConversationProps {
  /** Messages, or a host-provided empty or loading state. */
  children: ReactNode;
  /** Fixed content above the scrolling messages; the host supplies its styling. */
  header?: ReactNode;
  /** Fixed content below the messages, such as a composer. Shares the message column. */
  footer?: ReactNode;
  /** Accessible name for the region; the message log is named "{label} messages". */
  label?: string;
  className?: string;
  /** Overrides for the centered message column, which also wraps `footer`. */
  contentClassName?: string;
  /**
   * The scrolling element. Older messages inserted above the viewport are not
   * anchored; hosts that load history upward can adjust `scrollTop` here.
   */
  viewportRef?: Ref<HTMLDivElement>;
}

/**
 * Bounded-height chat layout that follows new output while the reader is at
 * the bottom. Remount with a conversation `key` when switching threads.
 *
 * The message log doesn't announce changes (`aria-live="off"`), since streamed
 * text would be read out word by word. Announce completed replies from a
 * polite `role="status"` region in the host.
 */
export function ChatConversation({
  children,
  header,
  footer,
  label = 'Conversation',
  className,
  contentClassName,
  viewportRef: externalViewportRef,
}: ChatConversationProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const followContent = () => {
      if (!followingRef.current) return;
      viewport.scrollTop = viewport.scrollHeight;
    };

    const handleScroll = () => {
      const nearBottom =
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <=
        FOLLOW_THRESHOLD;
      followingRef.current = nearBottom;
      setIsNearBottom(nearBottom);
    };

    followContent();
    const observer = new ResizeObserver(() => {
      followContent();
      handleScroll();
    });
    observer.observe(viewport);
    observer.observe(content);
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function scrollToLatest() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    followingRef.current = true;
    viewport.scrollTop = viewport.scrollHeight;
    setIsNearBottom(true);
    // The jump button disappears; keep keyboard focus in the reading region.
    viewport.focus({ preventScroll: true });
  }

  const columnClassName = cn(
    'mx-auto w-full min-w-0 max-w-2xl px-space-4',
    contentClassName
  );

  return (
    <section
      aria-label={label}
      className={cn(
        'flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-surface-level-1 text-primary',
        className
      )}
    >
      {header != null && <div className="min-w-0 shrink-0">{header}</div>}
      {/* The focus ring lives here so the viewport's scroll mask can't fade it. */}
      <div className="relative flex min-h-0 flex-1 flex-col has-[>[role=log]:focus-visible]:ring-2 has-[>[role=log]:focus-visible]:ring-inset has-[>[role=log]:focus-visible]:ring-focus">
        <div
          ref={mergeRefs([viewportRef, externalViewportRef])}
          role="log"
          aria-label={`${label} messages`}
          aria-live="off"
          tabIndex={0}
          className="scroll-mask-t min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain outline-hidden [--scroll-mask-fade-from-t:calc(100%_-_1.5rem)]"
        >
          <div
            ref={contentRef}
            className={cn(
              columnClassName,
              'flex min-h-full flex-col gap-space-6 py-space-5 pb-space-9'
            )}
          >
            {children}
          </div>
        </div>
        {!isNearBottom && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-space-3">
            <Button
              color="secondary"
              size="md"
              leftDecorator={CaretDownIcon}
              className="pointer-events-auto shadow-md hover:bg-elevated pointer-coarse:h-11"
              onClick={scrollToLatest}
            >
              Jump to latest
            </Button>
          </div>
        )}
      </div>
      {footer != null && (
        <div className={cn(columnClassName, 'shrink-0 py-space-3')}>
          {footer}
        </div>
      )}
    </section>
  );
}
