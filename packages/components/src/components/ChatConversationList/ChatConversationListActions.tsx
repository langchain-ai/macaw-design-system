import type { ReactNode } from 'react';

import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';

import { cn } from '../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../IconButton';

interface ChatConversationListActionsProps {
  title: string;
  disabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function ChatConversationListActions({
  title,
  disabled,
  open,
  onOpenChange,
  children,
}: ChatConversationListActionsProps) {
  const isMenuOpen = open && !disabled;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 right-0 mr-space-3 flex shrink-0 items-center border-2 border-transparent opacity-0 group-focus-within/conversation:opacity-100 group-hover/conversation:opacity-100 [@media(hover:none)]:static [@media(hover:none)]:opacity-100',
        isMenuOpen && 'opacity-100'
      )}
    >
      <DropdownMenu
        open={isMenuOpen}
        onOpenChange={(nextOpen) => onOpenChange(nextOpen && !disabled)}
      >
        <DropdownMenuTrigger asChild>
          <IconButton
            icon={DotsThreeIcon}
            iconWeight="regular"
            label={`Actions for ${title}`}
            size="xs"
            variant="plain"
            color="secondary"
            disabled={disabled}
            className={cn(
              'pointer-events-none cursor-pointer transition-none disabled:cursor-not-allowed group-focus-within/conversation:pointer-events-auto group-hover/conversation:pointer-events-auto [@media(hover:none)]:pointer-events-auto',
              isMenuOpen && 'pointer-events-auto'
            )}
            tooltipProps={{ disabled: true }}
            onClick={(event) => event.stopPropagation()}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          preventClickThrough
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
