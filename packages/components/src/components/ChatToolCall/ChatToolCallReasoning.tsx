import type { ReactNode } from 'react';

import { LightbulbIcon } from '@phosphor-icons/react/dist/ssr/Lightbulb';

import { ChatState, type ChatStateStatus } from '../ChatState';
import { Text } from '../Text';
import { ChatToolCallAccordion } from './ChatToolCallAccordion';
import {
  ChatToolCallGroupedTimer,
  useReportToGroup,
} from './ChatToolCallGroupContext';
import { ChatToolCallIcon } from './ChatToolCallIcon';
import { ChatToolCallStatusRow } from './ChatToolCallStatusRow';

export interface ChatToolCallReasoningProps {
  /** Only content intentionally disclosed by the host; never raw hidden model reasoning. */
  children: ReactNode;
  variant?: 'default' | 'simple';
  /** Simple row inspection; the host owns navigation, panes, and permissions. */
  onInspect?: () => void;
  /** Tooltip and accessible action label for Simple row inspection. */
  inspectLabel?: string;
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
  inspectLabel,
  label = 'Reasoning summary',
  status = 'completed',
  elapsedMs,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
}: ChatToolCallReasoningProps) {
  const inGroup = useReportToGroup({ status });
  const heading = (
    <span className="inline-flex min-w-0 items-center gap-space-2">
      <ChatToolCallIcon>
        <LightbulbIcon size={12} weight="regular" />
      </ChatToolCallIcon>
      <Text
        as="span"
        variant="xs"
        weight="medium"
        color="secondary"
        className="min-w-0 truncate"
      >
        {label}
      </Text>
    </span>
  );
  const state =
    status === 'completed' ? null : status === 'streaming' && inGroup ? (
      <ChatToolCallGroupedTimer elapsedMs={elapsedMs} />
    ) : (
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
        inspectLabel={inspectLabel}
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
      detailsClassName="break-words [overflow-wrap:anywhere]"
    >
      {children}
    </ChatToolCallAccordion>
  );
}
