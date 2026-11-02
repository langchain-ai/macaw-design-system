import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
} from 'react';

import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { DropdownMenuSeparator } from '../DropdownMenu';
import { Text } from '../Text';
import {
  ChatConversationListActionItem,
  ChatConversationListActions,
} from './ChatConversationListActions';

const InsideGroupContext = createContext(false);

export interface ChatConversationListGroupActions {
  /**
   * Hosts own rename and delete dialogs, confirmation, and persistence.
   * Missing callbacks disable their menu items.
   */
  onRename?: () => void;
  onDelete?: () => void;
}

export interface ChatConversationListGroupProps {
  title: string;
  /** `ChatConversationListItem`s. Groups can't be nested. */
  children?: ReactNode;
  actions?: ChatConversationListGroupActions;
  /** Controls expansion when provided; otherwise the group manages it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Disables the toggle and menu. Children keep their own disabled state. */
  disabled?: boolean;
  className?: string;
}

/**
 * A collapsible folder of conversations, one level deep. Its items join the
 * list's arrow-key navigation while it's open.
 */
export function ChatConversationListGroup({
  title,
  children,
  actions,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
}: ChatConversationListGroupProps) {
  const nested = useContext(InsideGroupContext);
  const contentId = useId();
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  useEffect(() => {
    if (nested) {
      console.error(
        'ChatConversationListGroup cannot be nested. Render groups as siblings in ChatConversationList.'
      );
    }
  }, [nested]);

  return (
    <div role="listitem" className={cn('min-w-0', className)}>
      <div className="group/conversation relative flex min-w-0 items-center rounded-lg hover:bg-surface-level-1-hover">
        <button
          type="button"
          data-conversation-trigger=""
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-space-2 rounded-md border-2 border-transparent bg-transparent px-space-3 py-space-2 text-left outline-hidden focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex size-4 shrink-0 items-center justify-center">
            <CaretRightIcon
              size={12}
              weight="regular"
              aria-hidden
              className={cn(
                'text-icon-secondary transition-transform duration-normal motion-reduce:transition-none',
                open && 'rotate-90'
              )}
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
          {/* Reserves room for the actions button, which sits over the row. */}
          {actions && (
            <span
              aria-hidden
              className="w-5 shrink-0 [@media(hover:none)]:hidden"
            />
          )}
        </button>
        {actions && (
          <ChatConversationListActions title={title} disabled={disabled}>
            <ChatConversationListActionItem
              icon={PencilSimpleIcon}
              label="Rename"
              onSelect={actions.onRename}
            />
            <DropdownMenuSeparator />
            <ChatConversationListActionItem
              icon={TrashIcon}
              label="Delete"
              onSelect={actions.onDelete}
              destructive
            />
          </ChatConversationListActions>
        )}
      </div>
      {/* Unmounted while closed, so arrow keys skip its items. */}
      {open && (
        <div
          id={contentId}
          role="list"
          aria-label={title}
          className="flex min-w-0 flex-col gap-space-1 pl-space-5 pt-space-1"
        >
          <InsideGroupContext.Provider value={true}>
            {children}
          </InsideGroupContext.Provider>
        </div>
      )}
    </div>
  );
}
