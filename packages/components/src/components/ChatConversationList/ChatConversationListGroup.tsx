import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';

import { cn } from '../../utils/cn';
import { DropdownMenuItem, DropdownMenuSeparator } from '../DropdownMenu';
import { Text } from '../Text';
import { ChatConversationListActions } from './ChatConversationListActions';
import type { ChatConversationListItemActions } from './ChatConversationListItem';

const InsideConversationGroupContext = createContext(false);

export interface ChatConversationListGroupProps {
  title: string;
  children?: ReactNode;
  /** Hosts own rename/delete dialogs, confirmation, and persistence. */
  actions?: Pick<ChatConversationListItemActions, 'onRename' | 'onDelete'>;
  /** Controls expansion when provided; otherwise the group manages it locally. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Children keep their own disabled state. */
  disabled?: boolean;
  className?: string;
}

export function ChatConversationListGroup({
  title,
  children,
  actions,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
}: ChatConversationListGroupProps) {
  const insideGroup = useContext(InsideConversationGroupContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasActions = Boolean(actions);

  useEffect(() => {
    if (disabled || !hasActions) setMenuOpen(false);
  }, [disabled, hasActions]);

  if (insideGroup) {
    throw new Error(
      'ChatConversationListGroup cannot be nested. Render folders as siblings in ChatConversationList.'
    );
  }

  return (
    <Collapsible
      role="listitem"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      className={cn('min-w-0', className)}
    >
      <div
        className={cn(
          'group/conversation relative flex min-w-0 items-center rounded-lg hover:bg-surface-level-1-hover',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <CollapsibleTrigger
          data-conversation-trigger=""
          aria-label={title}
          className="group/conversation-toggle flex min-w-0 flex-1 cursor-pointer items-center gap-space-2 rounded-md border-2 border-transparent bg-transparent px-space-3 py-space-2 text-left outline-hidden focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex size-4 shrink-0 items-center justify-center">
            <CaretRightIcon
              size={12}
              weight="regular"
              aria-hidden="true"
              className="text-icon-secondary transition-transform duration-normal group-data-[state=open]/conversation-toggle:rotate-90 motion-reduce:transition-none"
            />
          </span>
          <Text
            as="span"
            variant="sm"
            weight="medium"
            className="min-w-0 flex-1 truncate"
          >
            {title}
          </Text>
          {actions && (
            <span
              aria-hidden="true"
              className="w-5 shrink-0 [@media(hover:none)]:hidden"
            />
          )}
        </CollapsibleTrigger>
        {actions && (
          <ChatConversationListActions
            title={title}
            disabled={disabled}
            open={menuOpen}
            onOpenChange={setMenuOpen}
          >
            <DropdownMenuItem
              size="sm"
              className="gap-space-2"
              disabled={!actions.onRename}
              onSelect={actions.onRename}
            >
              <PencilSimpleIcon size={16} weight="regular" aria-hidden="true" />
              Rename
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
          </ChatConversationListActions>
        )}
      </div>
      <CollapsibleContent>
        <div
          role="list"
          aria-label={title}
          className="flex min-w-0 flex-col gap-space-1 pl-space-5 pt-space-1"
        >
          <InsideConversationGroupContext.Provider value={true}>
            {children}
          </InsideConversationGroupContext.Provider>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
