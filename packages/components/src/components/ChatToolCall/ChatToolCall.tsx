import { type ReactNode, useId } from 'react';

import { ChatState, type ChatStateStatus } from '../ChatState';
import { Text } from '../Text';
import type {
  ChatToolCallModel,
  ChatToolCallStatus,
} from './ChatToolCall.types';
import { formatChatToolCallValue } from './ChatToolCall.value';
import { ChatToolCallAccordion } from './ChatToolCallAccordion';
import { ChatToolCallDetails } from './ChatToolCallDetails';
import { ChatToolCallStatusRow } from './ChatToolCallStatusRow';

const STATUS_PRESENTATIONS = {
  pending: { label: 'Pending', status: 'pending' },
  running: { label: 'Running', status: 'streaming' },
  succeeded: { label: 'Succeeded', status: 'completed' },
  failed: { label: 'Failed', status: 'failed' },
  canceled: { label: 'Canceled', status: 'canceled' },
  'input-required': { label: 'Needs input', status: 'input-required' },
} as const satisfies Record<
  ChatToolCallStatus,
  { label: string; status: ChatStateStatus }
>;

export interface ChatToolCallProps {
  /** Render at the call's position in the host's ordered content stream. Use its stable ID as the React key. */
  toolCall: ChatToolCallModel;
  variant?: 'default' | 'simple';
  /** Simple row inspection; the host owns navigation, panes, and permissions. */
  onInspect?: () => void;
  label?: string;
  /** Noninteractive presentation slots; response controls belong in a separate content block. */
  icon?: ReactNode;
  /** Undefined previews args; null omits the summary. */
  summary?: ReactNode;
  /** Undefined uses generic details; null omits the detail region. */
  children?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

function ToolCallStatus({ toolCall }: Pick<ChatToolCallProps, 'toolCall'>) {
  const presentation = STATUS_PRESENTATIONS[toolCall.status];

  return (
    <ChatState
      variant="simple"
      label={presentation.label}
      status={presentation.status}
      showElapsed={toolCall.status === 'running'}
      elapsedMs={toolCall.elapsedMs}
    />
  );
}

export function ChatToolCall({
  toolCall,
  variant = 'default',
  onInspect,
  label,
  icon,
  summary,
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: ChatToolCallProps) {
  const summaryId = useId();
  const name = label ?? (toolCall.name || 'Tool');
  const heading = (
    <span className="inline-flex min-w-0 items-center gap-space-1">
      {icon != null && (
        <span
          aria-hidden="true"
          className="flex size-3 shrink-0 items-center justify-center text-icon-secondary [&_svg]:size-3"
        >
          {icon}
        </span>
      )}
      <Text
        as="span"
        variant="xs"
        weight="medium"
        color="secondary"
        className="min-w-0 truncate"
      >
        {name}
      </Text>
    </span>
  );

  if (variant === 'simple') {
    return (
      <ChatToolCallStatusRow
        groupLabel={`${name} tool call`}
        heading={heading}
        status={<ToolCallStatus toolCall={toolCall} />}
        onInspect={onInspect}
        className={className}
      />
    );
  }

  const detailContent =
    children === undefined ? (
      <ChatToolCallDetails toolCall={toolCall} />
    ) : (
      children
    );
  const summaryContent =
    summary === undefined && toolCall.args !== undefined
      ? formatChatToolCallValue(toolCall.args, 120)
      : summary;

  return (
    <ChatToolCallAccordion
      groupLabel={`${name} tool call`}
      triggerLabel={`Details for ${name}`}
      triggerDescriptionId={summaryContent != null ? summaryId : undefined}
      detailsLabel={`${name} details`}
      heading={
        <>
          {heading}
          {summaryContent != null && (
            <Text
              id={summaryId}
              as="span"
              variant="xs"
              color="tertiary"
              className="min-w-0 truncate rounded-md bg-surface-level-2 px-space-1 py-0"
            >
              {summaryContent}
            </Text>
          )}
        </>
      }
      status={<ToolCallStatus toolCall={toolCall} />}
      expanded={expanded}
      defaultExpanded={defaultExpanded}
      onExpandedChange={onExpandedChange}
      className={className}
    >
      {detailContent}
    </ChatToolCallAccordion>
  );
}
