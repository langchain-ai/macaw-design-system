import { type ComponentPropsWithRef, type ReactNode, useId } from 'react';

import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { PushPinIcon } from '@phosphor-icons/react/dist/ssr/PushPin';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

import { cn } from '../../utils/cn';
import { DropdownMenuSeparator } from '../DropdownMenu';
import { Text } from '../Text';
import {
  ChatConversationListActionItem,
  ChatConversationListActions,
} from './ChatConversationListActions';

export interface ChatConversationListItemActions {
  /**
   * Hosts own dialogs, confirmation, persistence, and mutation errors. Missing
   * callbacks disable their menu items.
   */
  onRename?: () => void;
  onTogglePin?: () => void;
  onDelete?: () => void;
  /** Labels the pin item Unpin. */
  pinned?: boolean;
  /**
   * Replaces the default Rename, Pin/Unpin, and Delete items. Compose
   * `DropdownMenuItem` and related primitives.
   */
  items?: ReactNode;
}

/**
 * Native button props and the ref target the conversation button, so hosts
 * can compose it with triggers such as `Tooltip`.
 */
export interface ChatConversationListItemProps extends Omit<
  ComponentPropsWithRef<'button'>,
  | 'children'
  | 'title'
  | 'type'
  | 'dangerouslySetInnerHTML'
  | 'aria-label'
  | 'aria-current'
> {
  /** Full title, used for the accessible name. */
  title: string;
  /** Replaces the visible title. Must be non-interactive; put controls in `actions`. */
  titleContent?: ReactNode;
  /**
   * Non-interactive trailing indicator with its own accessible text, such as a
   * spinner or attention icon. Takes the unread dot's place.
   */
  indicator?: ReactNode;
  /** Reveals a three-dot menu over the indicator on hover or keyboard focus. */
  actions?: ChatConversationListItemActions;
  selected?: boolean;
  unread?: boolean;
  /** Styles the outer row; other native props target the conversation button. */
  className?: string;
}

/** One conversation row in a `ChatConversationList` or `ChatConversationListGroup`. */
export function ChatConversationListItem({
  title,
  titleContent,
  indicator,
  actions,
  selected = false,
  unread = false,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  ...buttonProps
}: ChatConversationListItemProps) {
  const unreadId = useId();
  const indicatorId = useId();
  const hasIndicator = indicator != null && indicator !== false;
  const describedBy =
    [
      ariaDescribedBy,
      unread ? unreadId : undefined,
      hasIndicator ? indicatorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      role="listitem"
      className={cn(
        'group/conversation relative flex min-w-0 items-center rounded-lg',
        selected
          ? 'bg-selected hover:bg-selected-hover'
          : 'hover:bg-surface-level-1-hover',
        className
      )}
    >
      {/* A native button, not Button: the row needs a flexible title and
          sibling actions rather than Button's control sizing. */}
      <button
        {...buttonProps}
        type="button"
        data-conversation-trigger=""
        aria-label={title}
        aria-current={selected ? 'true' : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-space-2 rounded-md border-2 border-transparent bg-transparent px-space-3 py-space-2 text-left outline-hidden focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Text
          as="span"
          variant="sm"
          weight={unread ? 'medium' : 'normal'}
          className="min-w-0 flex-1 truncate"
        >
          {titleContent ?? title}
        </Text>
        {/* The trailing slot also reserves room for the actions button, which
            covers it on hover, focus, or while its menu is open. On touch the
            actions sit in the flow instead, so an empty slot collapses. */}
        {(hasIndicator || unread || actions) && (
          <span
            id={hasIndicator ? indicatorId : undefined}
            className={cn(
              'flex min-w-5 max-w-[40%] shrink-0 items-center justify-center overflow-hidden',
              actions &&
                '[@media(hover:hover)]:group-focus-within/conversation:opacity-0 [@media(hover:hover)]:group-hover/conversation:opacity-0 [@media(hover:hover)]:group-has-[[data-conversation-actions][data-state=open]]/conversation:opacity-0',
              !hasIndicator && !unread && '[@media(hover:none)]:hidden'
            )}
          >
            {hasIndicator ? (
              indicator
            ) : unread ? (
              <span
                aria-hidden
                className="size-1 shrink-0 rounded-full bg-brand"
              />
            ) : null}
          </span>
        )}
        {unread && (
          <span id={unreadId} className="sr-only">
            Unread
          </span>
        )}
      </button>
      {actions && (
        <ChatConversationListActions title={title} disabled={disabled}>
          {actions.items ?? (
            <>
              <ChatConversationListActionItem
                icon={PencilSimpleIcon}
                label="Rename"
                onSelect={actions.onRename}
              />
              <ChatConversationListActionItem
                icon={PushPinIcon}
                label={actions.pinned ? 'Unpin' : 'Pin'}
                onSelect={actions.onTogglePin}
              />
              <DropdownMenuSeparator />
              <ChatConversationListActionItem
                icon={TrashIcon}
                label="Delete"
                onSelect={actions.onDelete}
                destructive
              />
            </>
          )}
        </ChatConversationListActions>
      )}
    </div>
  );
}
