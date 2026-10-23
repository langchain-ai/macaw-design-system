import type { ReactNode } from 'react';

import { ChatState, type ChatStateStatus } from '../ChatState';
import { Text } from '../Text';
import { ChatToolCallAccordion } from './ChatToolCallAccordion';
import { ChatToolCallStatusRow } from './ChatToolCallStatusRow';

export interface ChatToolCallReasoningProps {
  /** Only content intentionally disclosed by the host; never raw hidden model reasoning. */
  children: ReactNode;
  variant?: 'default' | 'simple';
  /** Simple row inspection; the host owns navigation, panes, and permissions. */
  onInspect?: () => void;
  label?: string;
  status?: ChatStateStatus;
  elapsedMs?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function ChatToolCallReasoning({
  children,
  variant = 'default',
  onInspect,
  label = 'Reasoning summary',
  status = 'completed',
  elapsedMs,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
}: ChatToolCallReasoningProps) {
  const heading = (
    <Text
      as="span"
      variant="xs"
      weight="medium"
      color="secondary"
      className="min-w-0 truncate"
    >
      {label}
    </Text>
  );
  const state = (
    <ChatState
      variant="simple"
      status={status}
      showElapsed={status === 'streaming'}
      elapsedMs={elapsedMs}
    />
  );

  if (variant === 'simple') {
    return (
      <ChatToolCallStatusRow
        groupLabel={label}
        heading={heading}
        status={state}
        onInspect={onInspect}
      />
    );
  }

  return (
    <ChatToolCallAccordion
      groupLabel={label}
      triggerLabel={label}
      detailsLabel={`${label} details`}
      heading={heading}
      status={state}
      expanded={expanded}
      defaultExpanded={defaultExpanded}
      onExpandedChange={onExpandedChange}
      detailsClassName="break-words border-l-0 text-tertiary [overflow-wrap:anywhere]"
    >
      {children}
    </ChatToolCallAccordion>
  );
}
