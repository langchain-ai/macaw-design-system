import { type ReactNode, useId } from 'react';

import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Text } from '../Text';
import { ChatToolCallCaret } from './ChatToolCallCaret';
import { ChatToolCallCollapse } from './ChatToolCallCollapse';

export interface ChatToolCallGroupProps {
  /** Hosts supply the count/summary and group only consecutive content. */
  label: string;
  children: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export function ChatToolCallGroup({
  label,
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
      <Button
        type="button"
        variant="plain"
        color="secondary"
        size="sm"
        aria-label={label}
        aria-controls={contentId}
        aria-expanded={isExpanded}
        onClick={() => setExpanded(!isExpanded)}
        className="h-auto max-w-full justify-start border-0 gap-space-1 bg-transparent px-space-1 py-space-1 text-left shadow-none hover:bg-transparent"
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
      {/* Rows stay mounted while collapsed so nested expansion survives. */}
      <ChatToolCallCollapse
        open={isExpanded}
        keepMounted
        id={contentId}
        className="flex min-w-0 flex-col gap-0"
      >
        {children}
      </ChatToolCallCollapse>
    </div>
  );
}
