import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';

export interface ChatConversationListProps {
  'aria-label': string;
  children?: ReactNode;
  className?: string;
  /** Supplied by the host because children may include groups or adapters. */
  state?: 'ready' | 'loading' | 'empty';
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
  /** Rendered above any cached items; suppresses the empty state. */
  errorContent?: ReactNode;
  /** Host-owned controls outside the semantic list, rendered only when ready. */
  footer?: ReactNode;
}

function handleNavigation(event: KeyboardEvent<HTMLDivElement>) {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    !(event.target instanceof HTMLButtonElement) ||
    !event.target.matches('[data-conversation-trigger]') ||
    event.target.closest('[data-conversation-list]') !== event.currentTarget
  ) {
    return;
  }

  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[data-conversation-trigger]:not(:disabled)'
    )
  ).filter(
    (item) => item.closest('[data-conversation-list]') === event.currentTarget
  );
  const index = items.indexOf(event.target);
  if (index === -1) return;

  let nextIndex: number;
  switch (event.key) {
    case 'ArrowDown':
      nextIndex = Math.min(index + 1, items.length - 1);
      break;
    case 'ArrowUp':
      nextIndex = Math.max(index - 1, 0);
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = items.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  items[nextIndex]?.focus();
}

/** Focus navigation is local; selection, grouping, and data remain host-owned. */
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
            <div aria-hidden="true" className="flex flex-col gap-space-1">
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
