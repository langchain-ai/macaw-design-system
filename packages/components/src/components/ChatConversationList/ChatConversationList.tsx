import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';

export interface ChatConversationListProps {
  /** Names the list, and the loading status while `state` is `loading`. */
  'aria-label': string;
  /** `ChatConversationListItem`s and `ChatConversationListGroup`s. */
  children?: ReactNode;
  className?: string;
  /**
   * Set by the host, since children may be groups or adapters the list can't
   * count.
   */
  state?: 'ready' | 'loading' | 'empty';
  /** Replaces the default skeleton rows. */
  loadingContent?: ReactNode;
  /** Replaces the default "No conversations yet" message. */
  emptyContent?: ReactNode;
  /** Shown above any cached items, in place of the empty state. */
  errorContent?: ReactNode;
  /**
   * Host controls below the list, such as a Load more button. Shown only when
   * `state` is `ready`.
   */
  footer?: ReactNode;
}

const NAVIGATION_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End']);

/** Moves focus between this list's enabled rows, including open groups'. */
function handleNavigation(event: KeyboardEvent<HTMLDivElement>) {
  const list = event.currentTarget;
  const target = event.target;
  if (
    !NAVIGATION_KEYS.has(event.key) ||
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    !(target instanceof HTMLButtonElement) ||
    !target.matches('[data-conversation-trigger]')
  ) {
    return;
  }

  // Skips rows from another list rendered inside this one, such as in a
  // host's custom item.
  const rows = Array.from(
    list.querySelectorAll<HTMLButtonElement>(
      '[data-conversation-trigger]:not(:disabled)'
    )
  ).filter((row) => row.closest('[data-conversation-list]') === list);
  const index = rows.indexOf(target);
  if (index === -1) return;

  let nextIndex: number;
  switch (event.key) {
    case 'ArrowDown':
      nextIndex = Math.min(index + 1, rows.length - 1);
      break;
    case 'ArrowUp':
      nextIndex = Math.max(index - 1, 0);
      break;
    case 'Home':
      nextIndex = 0;
      break;
    default:
      nextIndex = rows.length - 1;
  }

  event.preventDefault();
  rows[nextIndex]?.focus();
}

/**
 * A compact list of conversations for a sidebar. It owns arrow-key focus
 * movement and its loading, empty, and error presentation; hosts own data,
 * selection, routing, pagination, and mutations.
 */
export function ChatConversationList({
  'aria-label': ariaLabel,
  children,
  className,
  state = 'ready',
  loadingContent,
  emptyContent,
  errorContent,
  footer,
}: ChatConversationListProps) {
  const hasError = errorContent != null && errorContent !== false;

  return (
    <div className={cn('min-w-0 p-space-2', className)}>
      {hasError && (
        <div role="alert" className="p-space-3 text-error-secondary">
          {errorContent}
        </div>
      )}
      {state === 'loading' ? (
        <div role="status">
          <span className="sr-only">Loading {ariaLabel}</span>
          {loadingContent ?? (
            <div aria-hidden className="flex flex-col gap-space-1">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-lg px-space-3 py-space-2"
                >
                  <Skeleton className="h-4 w-3/5 motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : state === 'empty' ? (
        !hasError && (
          <div role="status" className="p-space-8 text-center text-tertiary">
            {emptyContent ?? <Text variant="sm">No conversations yet</Text>}
          </div>
        )
      ) : (
        <>
          <div
            role="list"
            aria-label={ariaLabel}
            data-conversation-list=""
            className="flex min-w-0 flex-col gap-space-1"
            onKeyDown={handleNavigation}
          >
            {children}
          </div>
          {footer}
        </>
      )}
    </div>
  );
}
