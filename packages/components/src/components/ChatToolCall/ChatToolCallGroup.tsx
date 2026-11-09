import { type ReactNode, useId } from 'react';

import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatState, type ChatStateStatus } from '../ChatState';
import { Text } from '../Text';
import { ChatToolCallCaret } from './ChatToolCallCaret';
import { ChatToolCallCollapse } from './ChatToolCallCollapse';
import { ChatToolCallGroupStatusContext } from './ChatToolCallRowStatus';

export interface ChatToolCallGroupProps {
  /** Hosts supply the count/summary and group only consecutive content. */
  label: string;
  /**
   * Combined status of the grouped content, shown on the header. When set,
   * rows inside skip their success check and show only seconds while running;
   * other statuses stay on the row.
   */
  status?: ChatStateStatus;
  children: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export function ChatToolCallGroup({
  label,
  status,
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: ChatToolCallGroupProps) {
  const contentId = useId();
  const [isExpanded = false, setExpanded] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });

  return (
    <div className={cn('min-w-0 max-w-full font-sans text-xxs', className)}>
      <div className="flex min-w-0 items-center gap-space-2 pr-space-1">
        <Button
          type="button"
          variant="plain"
          color="secondary"
          size="sm"
          aria-label={label}
          aria-controls={contentId}
          aria-expanded={isExpanded}
          onClick={() => setExpanded(!isExpanded)}
          className="h-auto min-w-0 max-w-full justify-start border-0 gap-space-1 bg-transparent px-space-1 py-space-1 text-left shadow-none hover:bg-transparent"
        >
          <Text
            as="span"
            variant="xs"
            color="tertiary"
            className="min-w-0 truncate"
          >
            {label}
          </Text>
          <ChatToolCallCaret open={isExpanded} />
        </Button>
        {status && (
          <ChatState
            variant="simple"
            status={status}
            showElapsed={false}
            className="ml-auto shrink-0"
          />
        )}
      </div>
      <ChatToolCallGroupStatusContext.Provider value={status !== undefined}>
        <ChatToolCallCollapse
          open={isExpanded}
          keepMounted
          id={contentId}
          className="flex min-w-0 flex-col gap-0"
        >
          {children}
        </ChatToolCallCollapse>
      </ChatToolCallGroupStatusContext.Provider>
    </div>
  );
}
