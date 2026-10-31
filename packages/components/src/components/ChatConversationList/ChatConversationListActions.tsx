import { type ReactNode, useState } from 'react';

import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';

import { cn } from '../../utils/cn';
import type { IconComponent } from '../../utils/icon-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../IconButton';

interface ChatConversationListActionsProps {
  title: string;
  disabled: boolean;
  children: ReactNode;
}

/**
 * The three-dot menu for a row. It sits over the row's trailing slot and
 * appears on hover or keyboard focus; on touch it stays visible in the flow.
 */
export function ChatConversationListActions({
  title,
  disabled,
  children,
}: ChatConversationListActionsProps) {
  const [open, setOpen] = useState(false);
  // Closes the menu when the row becomes disabled, so it can't reopen on its
  // own once the row is enabled again.
  if (disabled && open) setOpen(false);

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 right-0 mr-space-3 flex shrink-0 items-center border-2 border-transparent opacity-0 group-focus-within/conversation:opacity-100 group-hover/conversation:opacity-100 [@media(hover:none)]:static [@media(hover:none)]:opacity-100',
        open && 'opacity-100'
      )}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <IconButton
            // Lets the row's indicator hide while the menu is open, which
            // Radix marks with data-state="open" on this trigger.
            data-conversation-actions=""
            icon={DotsThreeIcon}
            iconWeight="regular"
            label={`Actions for ${title}`}
            size="xs"
            variant="plain"
            color="secondary"
            disabled={disabled}
            className={cn(
              'pointer-events-none cursor-pointer transition-none disabled:cursor-not-allowed group-focus-within/conversation:pointer-events-auto group-hover/conversation:pointer-events-auto [@media(hover:none)]:pointer-events-auto',
              open && 'pointer-events-auto'
            )}
            tooltipProps={{ disabled: true }}
            // Keeps the click from reaching host handlers around the list.
            onClick={(event) => event.stopPropagation()}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          preventClickThrough
          // The menu portals out, but React still bubbles its clicks through
          // the row to host handlers.
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface ChatConversationListActionItemProps {
  icon: IconComponent;
  label: string;
  /** Missing callbacks disable the item. */
  onSelect?: () => void;
  destructive?: boolean;
}

/** One of the default Rename, Pin, or Delete entries. */
export function ChatConversationListActionItem({
  icon: Icon,
  label,
  onSelect,
  destructive = false,
}: ChatConversationListActionItemProps) {
  return (
    <DropdownMenuItem
      size="sm"
      className={cn('gap-space-2', destructive && 'text-error-secondary')}
      disabled={!onSelect}
      onSelect={onSelect}
    >
      <Icon size={16} weight="regular" aria-hidden />
      {label}
    </DropdownMenuItem>
  );
}
