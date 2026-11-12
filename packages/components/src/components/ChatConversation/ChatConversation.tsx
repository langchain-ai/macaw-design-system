import {
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';

import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/merge-refs';
import { Button } from '../Button';

/** Distance from the bottom, in px, that still counts as reading the latest output. */
const FOLLOW_THRESHOLD = 48;

const MESSAGE_ID_ATTRIBUTE = 'data-chat-message-id';
const MESSAGE_SELECTOR = `[${MESSAGE_ID_ATTRIBUTE}]`;

const COLUMN_CLASS_NAME = 'mx-auto w-full min-w-0 max-w-3xl px-space-4';

// Caps the top fade at 32px. Inline because the unlayered `.scroll-mask-t`
// rule in base.css overrides utility classes. The matching scroll padding
// keeps a pinned message, or anything scrolled into view, clear of the fade.
const TOP_FADE = '2rem';
const VIEWPORT_STYLE = {
  '--scroll-mask-fade-from-t': `calc(100% - ${TOP_FADE})`,
  scrollPaddingTop: TOP_FADE,
} as CSSProperties;

export interface ChatConversationHandle {
  /** Resume following the latest output and focus the reading region. */
  jumpToLatest: () => void;
  /** Bring a message to the top, reserving space for its reply. */
  pinMessage: (id: string) => void;
}

export interface ChatConversationProps {
  ref?: Ref<ChatConversationHandle>;
  /** Shared message/footer column overrides, including maximum width and padding. */
  columnClassName?: string;
  /** Replace the jump control; returning null hides it. Rendered only away from the end. */
  renderJumpToLatest?: (
    actions: Pick<ChatConversationHandle, 'jumpToLatest'>
  ) => ReactNode;
  /** Messages, or a host-provided empty or loading state. */
  children: ReactNode;
  /** Fixed content above the scrolling messages; the host supplies its styling. */
  header?: ReactNode;
  /** Fixed content below the messages, such as a composer. Shares the message column. */
  footer?: ReactNode;
  /** Accessible name for the region; the message log is named "{label} messages". */
  label?: string;
  className?: string;
  /**
   * `bottom` (default) keeps the newest content in view while the reader is at
   * the bottom. `none` never scrolls on its own; Jump to latest still appears.
   */
  follow?: 'bottom' | 'none';
  /**
   * ID of a message to bring to the top, usually the one just sent. Each new ID
   * scrolls it up once and reserves space below for the reply. Following
   * resumes at the bottom or on Jump to latest. Matches `data-chat-message-id`,
   * which `ChatMessage` sets.
   */
  pinnedMessageId?: string;
  /**
   * The scrolling element, for hosts that track or restore the reading
   * position. Content inserted above the first visible message, such as older
   * messages, keeps that message in place.
   */
  viewportRef?: Ref<HTMLDivElement>;
}

type Follow = NonNullable<ChatConversationProps['follow']>;

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
  ref,
  columnClassName,
  renderJumpToLatest,
  header,
  footer,
  label = 'Conversation',
  className,
  follow = 'bottom',
  pinnedMessageId,
  viewportRef: externalViewportRef,
}: ChatConversationProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<ConversationScroll | null>(null);
  const [showJump, setShowJump] = useState(false);
  const mergedViewportRef = useMemo(
    () => mergeRefs([viewportRef, externalViewportRef]),
    [externalViewportRef]
  );

  // Declared before the follow and pin effects so they find it on mount.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const spacer = spacerRef.current;
    if (!viewport || !content || !spacer) return;

    const scroll = connectConversationScroll(
      viewport,
      content,
      spacer,
      setShowJump
    );
    scrollRef.current = scroll;
    return () => {
      scroll.disconnect();
      scrollRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    scrollRef.current?.setFollow(follow);
  }, [follow]);

  useLayoutEffect(() => {
    if (pinnedMessageId !== undefined) scrollRef.current?.pin(pinnedMessageId);
  }, [pinnedMessageId]);

  useImperativeHandle(ref, () => ({
    jumpToLatest,
    pinMessage: (id) => scrollRef.current?.pin(id),
  }));

  function jumpToLatest() {
    scrollRef.current?.jumpToLatest();
    // The jump button disappears; keep keyboard focus in the reading region.
    viewportRef.current?.focus({ preventScroll: true });
  }

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
          ref={mergedViewportRef}
          role="log"
          aria-label={`${label} messages`}
          aria-live="off"
          tabIndex={0}
          style={VIEWPORT_STYLE}
          // Native scroll anchoring would repeat the adjustment the component
          // makes for content inserted above, so it is turned off here.
          className="peer scroll-mask-t min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain outline-hidden [overflow-anchor:none] [scrollbar-gutter:stable_both-edges]"
        >
          <div
            ref={contentRef}
            className={cn(
              COLUMN_CLASS_NAME,
              'flex min-h-full flex-col gap-space-6 py-space-5 pb-space-9',
              columnClassName
            )}
          >
            {children}
          </div>
          {/* Room for a pinned message to reach the top while its reply is short. */}
          <div ref={spacerRef} aria-hidden="true" />
        </div>
        {/* The focus ring sits on an overlay so the viewport's scroll mask can't fade it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-inset ring-focus peer-focus-visible:ring-2"
        />
        {showJump &&
          (renderJumpToLatest ? (
            renderJumpToLatest({ jumpToLatest })
          ) : (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-space-3">
              <Button
                color="secondary"
                size="md"
                leftDecorator={CaretDownIcon}
                className="pointer-events-auto shadow-md hover:bg-elevated pointer-coarse:h-11"
                onClick={jumpToLatest}
              >
                Jump to latest
              </Button>
            </div>
          ))}
      </div>
      {footer != null && (
        <div
          className={cn(
            COLUMN_CLASS_NAME,
            'shrink-0 py-space-3',
            columnClassName
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}

interface ConversationScroll {
  /** Applies the follow mode; the first call also sets the starting position. */
  setFollow: (follow: Follow) => void;
  pin: (id: string) => void;
  jumpToLatest: () => void;
  disconnect: () => void;
}

/**
 * Owns the log's scroll position: following the bottom, holding a pinned
 * message at the top, and keeping the reader's place when content above it
 * changes size. Every scroll it makes is instant.
 */
function connectConversationScroll(
  viewport: HTMLElement,
  content: HTMLElement,
  spacer: HTMLElement,
  onShowJumpChange: (showJump: boolean) => void
): ConversationScroll {
  let follow: Follow | undefined;
  /** Scroll to the bottom whenever the content or viewport resizes. */
  let following = false;
  let lastScrollTop = viewport.scrollTop;
  let spacerHeight = 0;
  /** A pin whose message hasn't rendered yet. */
  let pendingPinId: string | undefined;
  let pinnedId: string | undefined;
  let pinned: Element | null = null;
  /** Keeps the pinned message at the top until the reader scrolls. */
  let holdingPin = false;
  /** The first visible message and its offset within the scrolled content. */
  let anchor: { element: Element; top: number } | null = null;
  /** Keeps a pinned message clear of the top fade. */
  const pinInset = parseFloat(getComputedStyle(viewport).scrollPaddingTop) || 0;

  function offsetTop(element: Element) {
    return (
      element.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top +
      viewport.scrollTop
    );
  }

  /** Distance from the viewport's bottom edge to the end of the content, not counting the spacer. */
  function distanceToEnd() {
    return (
      viewport.scrollHeight -
      spacerHeight -
      viewport.clientHeight -
      viewport.scrollTop
    );
  }

  function findMessage(id: string) {
    return content.querySelector(
      `[${MESSAGE_ID_ATTRIBUTE}="${CSS.escape(id)}"]`
    );
  }

  function isVisible(element: Element, viewportTop: number) {
    const rect = element.getBoundingClientRect();
    return rect.height > 0 && rect.bottom > viewportTop;
  }

  function firstVisible(viewportTop: number) {
    const messages = content.querySelectorAll(MESSAGE_SELECTOR);
    for (const element of messages.length > 0 ? messages : content.children) {
      if (isVisible(element, viewportTop)) return element;
    }
    return null;
  }

  function setSpacer(height: number) {
    if (height === spacerHeight) return;
    spacerHeight = height;
    spacer.style.height = height > 0 ? `${height}px` : '';
  }

  function tryPendingPin() {
    if (pendingPinId === undefined) return;
    const element = findMessage(pendingPinId);
    if (!element) return;
    pinnedId = pendingPinId;
    pinned = element;
    pendingPinId = undefined;
    holdingPin = true;
    following = false;
    pendingPinObserver.disconnect();
  }

  function unpin() {
    pinnedId = undefined;
    pinned = null;
    holdingPin = false;
    setSpacer(0);
  }

  /**
   * Sizes the spacer so the pinned message can reach the top of the viewport,
   * and holds it there until the reader scrolls. The spacer shrinks as the
   * reply grows and is gone once the reply fills the viewport.
   */
  function layoutPin() {
    if (pinnedId === undefined) return;
    if (
      !pinned?.isConnected ||
      pinned.getAttribute(MESSAGE_ID_ATTRIBUTE) !== pinnedId
    ) {
      pinned = findMessage(pinnedId);
    }
    if (!pinned) {
      // The message was removed, so there is nothing left to hold in place.
      unpin();
      following = follow === 'bottom' && distanceToEnd() <= FOLLOW_THRESHOLD;
      return;
    }
    const target = Math.max(0, offsetTop(pinned) - pinInset);
    const contentHeight = viewport.scrollHeight - spacerHeight;
    setSpacer(
      Math.max(0, Math.ceil(target + viewport.clientHeight - contentHeight))
    );
    if (holdingPin) viewport.scrollTop = target;
  }

  /** Moves with content that changed size above the first visible message. */
  function restoreAnchor() {
    if (!anchor?.element.isConnected) return;
    const shift = offsetTop(anchor.element) - anchor.top;
    if (Math.abs(shift) >= 1) viewport.scrollTop += shift;
  }

  function snapshotAnchor(rescan: boolean) {
    if (following) {
      anchor = null;
      return;
    }
    const viewportTop = viewport.getBoundingClientRect().top;
    let element = rescan ? null : anchor?.element;
    if (!element?.isConnected || !isVisible(element, viewportTop)) {
      element = firstVisible(viewportTop);
    }
    anchor = element ? { element, top: offsetTop(element) } : null;
  }

  /**
   * Records where the reader is after a scroll event, a resize, or a
   * reposition the component made itself. Only a scroll event can be the
   * reader's own movement: `lastScrollTop` is synced after every scroll the
   * component makes, so the events those scrolls fire read as no movement.
   */
  function update(source: 'scroll' | 'resize' | 'reposition') {
    const { scrollTop } = viewport;
    const atEnd = distanceToEnd() <= FOLLOW_THRESHOLD;
    // When content below shrinks, the browser pulls scrollTop back to the new
    // end before the spacer can grow; that isn't the reader scrolling.
    const clamped =
      scrollTop < lastScrollTop &&
      viewport.scrollHeight - viewport.clientHeight - scrollTop <= 1;
    if (pinnedId !== undefined) {
      if (source === 'scroll' && scrollTop !== lastScrollTop && !clamped) {
        holdingPin = false;
        // Scrolling down to the end of a reply that outgrew the viewport
        // hands back to bottom-following.
        if (scrollTop > lastScrollTop && atEnd && spacerHeight === 0) {
          unpin();
          following = follow === 'bottom';
        }
      }
    } else if (follow === 'bottom') {
      // Only scrolling up stops following. The scroll event from our own
      // scroll to the bottom can land after more content arrives, leaving a
      // gap the reader didn't make.
      following = atEnd || (following && scrollTop >= lastScrollTop);
    }
    lastScrollTop = scrollTop;
    onShowJumpChange(!following && !atEnd);
    snapshotAnchor(source !== 'resize');
  }

  const handleScroll = () => update('scroll');

  function relayout() {
    tryPendingPin();
    layoutPin();
    if (following) viewport.scrollTop = viewport.scrollHeight;
    else if (!holdingPin) restoreAnchor();
    update('resize');
  }

  const observer = new ResizeObserver(relayout);
  // While the content is shorter than the viewport, `min-h-full` keeps its
  // size fixed, so a newly rendered message doesn't trigger a resize.
  const pendingPinObserver = new MutationObserver(() => {
    if (pendingPinId !== undefined && findMessage(pendingPinId)) relayout();
  });
  observer.observe(viewport);
  observer.observe(content);
  viewport.addEventListener('scroll', handleScroll, { passive: true });

  return {
    setFollow(nextFollow) {
      const isFirst = follow === undefined;
      follow = nextFollow;
      if (pinnedId === undefined) {
        following =
          nextFollow === 'bottom' &&
          (isFirst || distanceToEnd() <= FOLLOW_THRESHOLD);
        if (following) viewport.scrollTop = viewport.scrollHeight;
      }
      update('reposition');
    },
    pin(id) {
      pendingPinId = id;
      tryPendingPin();
      if (pendingPinId !== undefined) {
        pendingPinObserver.observe(content, { childList: true, subtree: true });
      }
      layoutPin();
      update('reposition');
    },
    jumpToLatest() {
      pendingPinId = undefined;
      pendingPinObserver.disconnect();
      unpin();
      following = follow === 'bottom';
      viewport.scrollTop = viewport.scrollHeight;
      update('reposition');
    },
    disconnect() {
      observer.disconnect();
      pendingPinObserver.disconnect();
      viewport.removeEventListener('scroll', handleScroll);
      setSpacer(0);
    },
  };
}
