import { type ReactNode, useId, useState } from 'react';

import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatState, type ChatStateStatus } from '../ChatState';
import type { ChatToolCallStatus } from '../ChatToolCall';
import { ChatToolCallCaret } from '../ChatToolCall/ChatToolCallCaret';
import { ChatToolCallCollapse } from '../ChatToolCall/ChatToolCallCollapse';
import { useReportToGroup } from '../ChatToolCall/ChatToolCallGroupContext';
import { ChatToolCallIcon } from '../ChatToolCall/ChatToolCallIcon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { LoadingIndicator } from '../ThinkingState';
import type { ChatSubagentModel } from './ChatSubagent.types';

import thinkingStyles from '../ThinkingState/ThinkingState.module.css';
import styles from './ChatSubagent.module.css';

const STATUS_PRESENTATIONS = {
  pending: { label: 'Pending', status: 'pending' },
  running: { label: 'Running', status: 'streaming' },
  succeeded: { label: 'Completed', status: 'completed' },
  failed: { label: 'Failed', status: 'failed' },
  canceled: { label: 'Canceled', status: 'canceled' },
  'input-required': { label: 'Needs input', status: 'input-required' },
} as const satisfies Record<
  ChatToolCallStatus,
  { label: string; status: ChatStateStatus }
>;

const STATUS_BORDERS: Partial<Record<ChatToolCallStatus, string>> = {
  running: 'border-brand-subtle',
  'input-required': 'border-warning',
};

const SETTLED = new Set<ChatToolCallStatus>([
  'succeeded',
  'failed',
  'canceled',
]);

// Entrances and swaps share the system's ease-out curve.
const ENTER =
  'animate-in fade-in fill-mode-backwards ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none';

export interface ChatSubagentProps {
  /** Render at the subagent's position in the stream; key it by its stable ID. */
  subagent: ChatSubagentModel;
  /** Visible name; defaults to the model's name. */
  label?: string;
  /** Leading 12px single-color icon. Undefined uses a robot; null omits it. */
  icon?: ReactNode;
  /**
   * Noninteractive line for the current step while the subagent runs, such
   * as its latest tool call. A new string slides in; it is not announced, the
   * status is.
   */
  activity?: ReactNode;
  /** Short, noninteractive summary of the outcome, shown once it finishes. */
  result?: ReactNode;
  /** Opens the subagent's full thread; the host owns panes and navigation. */
  onOpen?: () => void;
  /** Accessible label and tooltip for `onOpen`. */
  openLabel?: string;
  /**
   * Expandable details, such as the subagent's own messages and tool calls.
   * They mount only while expanded, so a host can subscribe to the
   * subagent's stream when the reader opens it.
   */
  children?: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/**
 * One delegated agent run: its name, task, live status, and current step,
 * then its outcome. Place it where the agent started the subagent.
 */
export function ChatSubagent({
  subagent,
  label,
  icon,
  activity,
  result,
  onOpen,
  openLabel = 'Open subagent',
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: ChatSubagentProps) {
  const detailsId = useId();
  const taskId = useId();
  const presentation = STATUS_PRESENTATIONS[subagent.status];
  useReportToGroup({ status: presentation.status, icon });
  const name = label ?? (subagent.name || 'Subagent');
  const hasDetails = children != null && children !== false;
  const [expandedState = false, setExpanded] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });
  const isExpanded = hasDetails && expandedState;
  const running = subagent.status === 'running';
  const settled = SETTLED.has(subagent.status);
  // Cards restored from history appear at rest; only live work animates in.
  const [mountedLive] = useState(!settled);
  const [observedRun, setObservedRun] = useState(running);
  if (running && !observedRun) setObservedRun(true);
  const resolvedIcon =
    icon === undefined ? <RobotIcon size={12} weight="regular" /> : icon;

  const heading = (
    <span className="flex min-w-0 items-center gap-space-2">
      {resolvedIcon != null && (
        <ChatToolCallIcon>{resolvedIcon}</ChatToolCallIcon>
      )}
      <Text as="span" variant="sm" weight="medium" className="min-w-0 truncate">
        {name}
      </Text>
    </span>
  );

  return (
    <div
      role="group"
      aria-label={`${name} subagent`}
      data-state={subagent.status}
      className={cn(
        'relative flex min-w-0 max-w-full flex-col gap-space-1 rounded-lg border border-subtle bg-elevated py-space-2 font-sans text-primary',
        'transition-[border-color,background-color] duration-slow motion-reduce:transition-none',
        hasDetails && 'has-[[data-subagent-toggle]:hover]:bg-elevated-hover',
        STATUS_BORDERS[subagent.status],
        running && styles.running,
        mountedLive && cn(ENTER, 'slide-in-from-bottom-1 duration-slow'),
        className
      )}
    >
      <div className="relative flex min-w-0 items-center gap-space-2 px-space-3">
        {hasDetails ? (
          <Button
            type="button"
            variant="plain"
            color="secondary"
            size="sm"
            data-subagent-toggle=""
            aria-label={`Details for ${name}`}
            aria-describedby={subagent.task ? taskId : undefined}
            aria-controls={detailsId}
            aria-expanded={isExpanded}
            onClick={() => setExpanded(!isExpanded)}
            // Stretched over the card's header so the whole row toggles details.
            className="static h-auto min-w-0 flex-1 justify-start gap-space-2 border-0 bg-transparent px-0 py-0 text-left shadow-none outline-none after:absolute after:inset-x-0 after:-inset-y-space-2 after:rounded-t-lg hover:bg-transparent focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-focus"
          >
            {heading}
          </Button>
        ) : (
          <span className="flex min-w-0 flex-1 items-center">{heading}</span>
        )}
        <ChatState
          status={presentation.status}
          label={presentation.label}
          showElapsed={running || subagent.elapsedMs !== undefined}
          elapsedMs={subagent.elapsedMs}
          startedAt={subagent.startedAt}
          className="shrink-0"
        />
        {onOpen && (
          // Raised above the stretched toggle so it stays clickable.
          <IconButton
            type="button"
            icon={ArrowSquareOutIcon}
            iconWeight="regular"
            size="xs"
            variant="plain"
            color="secondary"
            // The card's group name already says which subagent this opens.
            label={openLabel}
            onClick={onOpen}
            className="relative z-[1] shrink-0"
          />
        )}
        {hasDetails && <ChatToolCallCaret open={isExpanded} />}
      </div>
      {subagent.task && (
        <Text
          id={taskId}
          variant="xs"
          color="tertiary"
          className="line-clamp-2 px-space-3 [overflow-wrap:anywhere]"
        >
          {subagent.task}
        </Text>
      )}
      {running && activity != null && (
        <div className="flex min-w-0 items-center gap-space-2 overflow-hidden px-space-3">
          <LoadingIndicator size="xs" tone="neutral" />
          <span
            // A new step replaces the last one with a short upward slide. The
            // slide stays on this wrapper so it doesn't replace the shimmer.
            key={typeof activity === 'string' ? activity : undefined}
            className={cn(
              'flex min-w-0',
              ENTER,
              'slide-in-from-bottom-2 duration-normal'
            )}
          >
            <Text
              as="span"
              variant="xs"
              className={cn('min-w-0 truncate', thinkingStyles.shimmer)}
            >
              {activity}
            </Text>
          </span>
        </div>
      )}
      {!running && result != null && (
        <div
          className={cn(
            'line-clamp-3 px-space-3 text-xs text-secondary [overflow-wrap:anywhere]',
            observedRun && cn(ENTER, 'slide-in-from-top-1 duration-slow')
          )}
        >
          {result}
        </div>
      )}
      {hasDetails && (
        <ChatToolCallCollapse
          open={isExpanded}
          id={detailsId}
          role="region"
          aria-label={`${name} details`}
          className="mt-space-1 border-t border-subtle px-space-3 pt-space-2"
        >
          {children}
        </ChatToolCallCollapse>
      )}
    </div>
  );
}

export interface ChatSubagentGroupProps {
  /** Names the group, such as "3 subagents". */
  label: string;
  /** `ChatSubagent`s started together; they share rows when space allows. */
  children: ReactNode;
  className?: string;
}

/**
 * Lays out subagents that run in parallel in a responsive grid. Cards that
 * arrive together enter in a short stagger.
 */
export function ChatSubagentGroup({
  label,
  children,
  className,
}: ChatSubagentGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('@container/subagents min-w-0 max-w-full', className)}
    >
      <div className="grid min-w-0 gap-space-2 @[560px]/subagents:grid-cols-2 [&>:nth-child(2)]:[animation-delay:60ms] [&>:nth-child(3)]:[animation-delay:120ms] [&>:nth-child(n+4)]:[animation-delay:180ms]">
        {children}
      </div>
    </div>
  );
}
