import type { ComponentPropsWithRef, ReactNode } from 'react';
import { useEffect, useId, useState } from 'react';

import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { PushPinIcon } from '@phosphor-icons/react/dist/ssr/PushPin';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

import { cn } from '../../utils/cn';
import { DropdownMenuItem, DropdownMenuSeparator } from '../DropdownMenu';
import { Text } from '../Text';
import { ChatConversationListActions } from './ChatConversationListActions';

export interface ChatConversationListItemActions {
  /** Hosts own dialogs, confirmation, persistence, and mutation errors. Missing callbacks disable their menu items. */
  onRename?: () => void;
  onTogglePin?: () => void;
  onDelete?: () => void;
  pinned?: boolean;
  /** Replaces the default Rename, Pin/Unpin, Delete items. Compose DropdownMenuItem and related primitives. */
  items?: ReactNode;
}

/** Native button props and ref target the conversation button for consumer composition. */
export interface ChatConversationListItemProps extends Omit<
  ComponentPropsWithRef<'button'>,
  | 'children'
  | 'title'
  | 'type'
  | 'dangerouslySetInnerHTML'
  | 'aria-label'
  | 'aria-current'
> {
  /** Full title used for the accessible name. */
  title: string;
  /** Display slots must be non-interactive. Put controls in actions. */
  titleContent?: ReactNode;
  /** Non-interactive trailing indicator with accessible text; overrides the unread dot. */
  indicator?: ReactNode;
  /** Reveals a three-dot menu in place of the indicator on hover or keyboard focus. */
  actions?: ChatConversationListItemActions;
  selected?: boolean;
  unread?: boolean;
  /** Styles the outer row; other native props target the conversation button. */
  className?: string;
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  const descriptionId = useId();
  const indicatorId = useId();
  const hasActions = Boolean(actions);
  const hasIndicator = indicator != null && indicator !== false;
  const describedBy =
    [
      ariaDescribedBy,
      unread ? descriptionId : undefined,
      hasIndicator ? indicatorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  useEffect(() => {
    if (disabled || !hasActions) setMenuOpen(false);
  }, [disabled, hasActions]);

  return (
    <div
      role="listitem"
      className={cn(
        'group/conversation relative flex min-w-0 items-center rounded-lg',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        selected
          ? 'bg-selected hover:bg-selected-hover'
          : 'hover:bg-surface-level-1-hover',
        className
      )}
    >
      {/* A navigation row needs a flexible title and independent sibling actions instead of Button control sizing. */}
      {/* eslint-disable-next-line react/forbid-elements */}
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
        {(hasIndicator || unread || actions) && (
          <span
            id={hasIndicator ? indicatorId : undefined}
            className={cn(
              'flex min-w-5 max-w-[40%] shrink-0 items-center justify-center overflow-hidden',
              actions &&
                '[@media(hover:hover)]:group-focus-within/conversation:opacity-0 [@media(hover:hover)]:group-hover/conversation:opacity-0',
              menuOpen && '[@media(hover:hover)]:opacity-0',
              !hasIndicator && !unread && '[@media(hover:none)]:hidden'
            )}
          >
            {hasIndicator ? (
              indicator
            ) : unread ? (
              <span
                aria-hidden="true"
                className="size-1 shrink-0 rounded-full bg-brand"
              />
            ) : null}
          </span>
        )}
        {unread && (
          <span id={descriptionId} className="sr-only">
            Unread
          </span>
        )}
      </button>
      {actions && (
        <ChatConversationListActions
          title={title}
          disabled={disabled}
          open={menuOpen}
          onOpenChange={setMenuOpen}
        >
          {actions.items ?? (
            <>
              <DropdownMenuItem
                size="sm"
                className="gap-space-2"
                disabled={!actions.onRename}
                onSelect={actions.onRename}
              >
                <PencilSimpleIcon
                  size={16}
                  weight="regular"
                  aria-hidden="true"
                />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                size="sm"
                className="gap-space-2"
                disabled={!actions.onTogglePin}
                onSelect={actions.onTogglePin}
              >
                <PushPinIcon size={16} weight="regular" aria-hidden="true" />
                {actions.pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                size="sm"
                className="gap-space-2 text-error-secondary"
                disabled={!actions.onDelete}
                onSelect={actions.onDelete}
              >
                <TrashIcon size={16} weight="regular" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </ChatConversationListActions>
      )}
    </div>
  );
}
