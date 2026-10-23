import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { cn } from '../../utils/cn';
import { Button } from '../Button';

export interface ChatConversationProps {
  children: ReactNode;
  /** Fixed content above the scrolling messages; the host supplies its styling. */
  header?: ReactNode;
  footer?: ReactNode;
  label?: string;
  className?: string;
  contentClassName?: string;
}

export interface ChatConversationHandle {
  /** Resume following new content. Set focus for keyboard navigation; omit it when submitting from the composer. */
  scrollToLatest: (options?: { focus?: boolean }) => void;
}

/** Scroll shell. Remount with a conversation key when switching threads. */
export const ChatConversation = forwardRef<
  ChatConversationHandle,
  ChatConversationProps
>(function ChatConversation(
  {
    children,
    header,
    footer,
    label = 'Conversation',
    className,
    contentClassName,
  },
  ref
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    function followContent() {
      if (!viewport || !followingRef.current) return;
      viewport.scrollTop = viewport.scrollHeight;
      lastScrollTopRef.current = viewport.scrollTop;
    }

    function handleScroll() {
      if (!viewport) return;
      const nearBottom =
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <=
        48;
      // A scroll-to-bottom event may arrive after new content has grown. Only
      // upward movement pauses following; stale programmatic events do not.
      if (nearBottom) followingRef.current = true;
      else if (viewport.scrollTop < lastScrollTopRef.current) {
        followingRef.current = false;
      }
      lastScrollTopRef.current = viewport.scrollTop;
      setIsNearBottom(nearBottom);
    }

    followContent();
    let frame: number | undefined;
    const observer = new ResizeObserver(() => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        followContent();
        handleScroll();
      });
    });
    observer.observe(viewport);
    observer.observe(content);
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function scrollToLatest({ focus = false }: { focus?: boolean } = {}) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    followingRef.current = true;
    viewport.scrollTop = viewport.scrollHeight;
    lastScrollTopRef.current = viewport.scrollTop;
    setIsNearBottom(true);
    if (focus) {
      const messages =
        contentRef.current?.querySelectorAll<HTMLElement>('[data-message-id]');
      const target = messages?.[messages.length - 1] ?? contentRef.current;
      target?.focus({ preventScroll: true });
    }
  }

  useImperativeHandle(ref, () => ({ scrollToLatest }));

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
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={viewportRef}
          role="log"
          aria-label={`${label} messages`}
          aria-live="off"
          tabIndex={0}
          className="focus-visible:ring-focus min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset"
        >
          <div
            ref={contentRef}
            tabIndex={-1}
            className={cn(
              columnClassName,
              'flex min-h-full flex-col gap-space-6 py-space-5 pb-space-9'
            )}
          >
            {children}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b/srgb from-surface-level-1 to-transparent"
        />
        {!isNearBottom && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-space-3">
            <Button
              color="secondary"
              size="md"
              leftDecorator={CaretDownIcon}
              className="pointer-events-auto shadow-md hover:bg-elevated"
              onClick={() => scrollToLatest({ focus: true })}
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
});
