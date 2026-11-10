import { type ReactNode, useState } from 'react';

import { LightbulbIcon } from '@phosphor-icons/react/dist/ssr/Lightbulb';

import { cn } from '../../utils/cn';
import type { ChatStateStatus } from '../ChatState';
import { Text } from '../Text';
import { ChatToolCallAccordion } from './ChatToolCallAccordion';
import { useReportToGroup } from './ChatToolCallGroupContext';
import { ChatToolCallIcon } from './ChatToolCallIcon';
import { ChatToolCallRowStatus } from './ChatToolCallRowStatus';
import { ChatToolCallStatusRow } from './ChatToolCallStatusRow';

import thinkingStyles from '../ThinkingState/ThinkingState.module.css';

export interface ChatToolCallReasoningProps {
  /** Only content intentionally disclosed by the host; never raw hidden model reasoning. */
  children: ReactNode;
  variant?: 'default' | 'simple';
  /** Simple row inspection; the host owns navigation, panes, and permissions. */
  onInspect?: () => void;
  /** Tooltip and accessible action label for Simple row inspection. */
  inspectLabel?: string;
  /** Use a duration once done, e.g. `Thought for ${formatChatDuration(ms)}`. */
  label?: string;
  /** Leading 12px single-color icon. Undefined uses a lightbulb; null omits it. */
  icon?: ReactNode;
  status?: ChatStateStatus;
  elapsedMs?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Open the details while `status` is `streaming` and close them when it
   * ends, so the reader can watch the reasoning arrive. Once the reader opens
   * or closes the details, their choice sticks. Ignored when `expanded` is
   * controlled; replaces `defaultExpanded`.
   */
  expandWhileStreaming?: boolean;
}

export function ChatToolCallReasoning({
  children,
  variant = 'default',
  onInspect,
  inspectLabel,
  label = 'Reasoning summary',
  icon,
  status = 'completed',
  elapsedMs,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  expandWhileStreaming = false,
}: ChatToolCallReasoningProps) {
  const inGroup = useReportToGroup({ status });
  const [readerChoice, setReaderChoice] = useState<boolean>();
  const followsStream = expandWhileStreaming && expanded === undefined;
  const resolvedIcon =
    icon === undefined ? <LightbulbIcon size={12} weight="regular" /> : icon;
  const heading = (
    <span className="inline-flex min-w-0 items-center gap-space-2">
      {resolvedIcon != null && (
        <ChatToolCallIcon>{resolvedIcon}</ChatToolCallIcon>
      )}
      <Text
        as="span"
        variant="xs"
        weight="medium"
        // Streaming reasoning shimmers like ThinkingState's active label.
        color={status === 'streaming' ? undefined : 'secondary'}
        className={cn(
          'min-w-0 truncate',
          status === 'streaming' && thinkingStyles.shimmer
        )}
      >
        {label}
      </Text>
    </span>
  );
  const state = (
    <ChatToolCallRowStatus
      status={status}
      elapsedMs={elapsedMs}
      inGroup={inGroup}
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
      expanded={
        followsStream ? (readerChoice ?? status === 'streaming') : expanded
      }
      defaultExpanded={defaultExpanded}
      onExpandedChange={(next) => {
        if (followsStream) setReaderChoice(next);
        onExpandedChange?.(next);
      }}
      detailsClassName="break-words [overflow-wrap:anywhere]"
    >
      {children}
    </ChatToolCallAccordion>
  );
}
