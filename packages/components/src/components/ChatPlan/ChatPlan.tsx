import { useId, useState } from 'react';

import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CircleIcon } from '@phosphor-icons/react/dist/ssr/Circle';
import { CircleDashedIcon } from '@phosphor-icons/react/dist/ssr/CircleDashed';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatToolCallCaret } from '../ChatToolCall/ChatToolCallCaret';
import { ChatToolCallCollapse } from '../ChatToolCall/ChatToolCallCollapse';
import { CircularProgress } from '../CircularProgress';
import { Text } from '../Text';

export type ChatPlanItemStatus = 'pending' | 'in-progress' | 'completed';

export interface ChatPlanItem {
  /** Stable across updates, so items keep their place as the plan changes. */
  id: string;
  label: string;
  status: ChatPlanItemStatus;
}

export interface ChatPlanProps {
  /** Items in the agent's order. Renders nothing when empty. */
  items: readonly ChatPlanItem[];
  /** Defaults to "Plan". */
  title?: string;
  /**
   * `drawer` fits `ChatComposer`'s drawer slot, alone or stacked with other
   * drawer content.
   */
  presentation?: 'block' | 'drawer';
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

// Outline icons in ChatState's colors, so a plan reads like the rest of the chat.
const ITEM_PRESENTATIONS = {
  pending: {
    label: 'Pending',
    icon: CircleIcon,
    iconClassName: 'text-icon-tertiary',
    textColor: 'secondary',
  },
  'in-progress': {
    label: 'In progress',
    icon: CircleDashedIcon,
    iconClassName: 'text-icon-secondary',
    textColor: 'primary',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircleIcon,
    iconClassName: 'text-icon-success',
    textColor: 'tertiary',
  },
} as const;

const ENTER =
  'animate-in fade-in ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none';

function summarize(items: readonly ChatPlanItem[]) {
  const total = items.length;
  const done = items.filter((item) => item.status === 'completed').length;
  const currentIndex = items.findIndex((item) => item.status === 'in-progress');
  if (currentIndex !== -1) {
    return {
      done,
      progress: `Task ${currentIndex + 1} of ${total}`,
      current: items[currentIndex].label,
    };
  }
  return {
    done,
    progress: done === total ? `All ${total} done` : `${done} of ${total} done`,
    current: undefined,
  };
}

/**
 * An agent's task list, such as the todos a deep agent writes as it works.
 * Collapsed, it shows progress and the current task; expanded, every task.
 */
export function ChatPlan({
  items,
  title = 'Plan',
  presentation = 'block',
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: ChatPlanProps) {
  const listId = useId();
  const currentId = useId();
  const [isExpanded = false, setExpanded] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });
  // A plan restored from history appears at rest; only changes animate.
  const [initial] = useState(() => ({
    completed: new Set(
      items.filter((item) => item.status === 'completed').map((item) => item.id)
    ),
    current: summarize(items).current,
  }));
  if (items.length === 0) return null;

  const isDrawer = presentation === 'drawer';
  const { done, progress, current } = summarize(items);

  return (
    <section
      aria-label={title}
      className={cn(
        'flex min-w-0 max-w-full flex-col font-sans text-primary',
        isDrawer
          ? // Its own neutral surface keeps the plan neutral when it shares a
            // drawer whose intent colors a question or notice.
            cn(
              'bg-surface-level-2 px-space-4 py-space-2',
              ENTER,
              'duration-normal'
            )
          : 'rounded-lg border border-subtle bg-elevated px-space-3 py-space-2',
        className
      )}
    >
      <Button
        type="button"
        variant="plain"
        color="secondary"
        size="sm"
        aria-label={`${title}: ${progress}`}
        aria-describedby={current && !isExpanded ? currentId : undefined}
        aria-expanded={isExpanded}
        aria-controls={listId}
        onClick={() => setExpanded(!isExpanded)}
        className="h-auto min-w-0 justify-start gap-space-2 border-0 bg-transparent px-0 py-space-1 text-left shadow-none hover:bg-transparent"
      >
        <CircularProgress
          size={14}
          strokeWidth={2}
          segments={[{ variant: 'success', percentage: done / items.length }]}
          className="shrink-0"
        />
        <Text as="span" variant="xs" weight="medium" className="shrink-0">
          {title}
        </Text>
        <Text
          as="span"
          variant="xs"
          color="secondary"
          className="shrink-0 tabular-nums"
        >
          {progress}
        </Text>
        {current && !isExpanded && (
          <Text
            // The next task crossfades in as the agent moves on.
            key={current}
            id={currentId}
            as="span"
            variant="xs"
            color="tertiary"
            className={cn(
              'min-w-0 truncate',
              current !== initial.current &&
                cn(ENTER, 'slide-in-from-bottom-1 duration-normal')
            )}
          >
            {current}
          </Text>
        )}
        <ChatToolCallCaret open={isExpanded} className="ml-auto" />
      </Button>
      <ChatToolCallCollapse open={isExpanded} id={listId}>
        <ol
          aria-label={`${title} tasks`}
          className={cn(
            'm-0 flex list-none flex-col gap-space-1 p-0 pb-space-1 pt-space-1',
            // Short enough that a question sharing the drawer stays in view.
            isDrawer &&
              'max-h-[min(12rem,30dvh)] overflow-y-auto overscroll-contain'
          )}
        >
          {items.map((item) => {
            const {
              icon: StatusIcon,
              iconClassName,
              label,
              textColor,
            } = ITEM_PRESENTATIONS[item.status];
            const justCompleted =
              item.status === 'completed' && !initial.completed.has(item.id);
            return (
              <li
                key={item.id}
                data-status={item.status}
                className="flex min-w-0 items-start gap-space-2"
              >
                <StatusIcon
                  // Remounts on each status change so a new check pops in.
                  key={item.status}
                  size={14}
                  weight="regular"
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 shrink-0',
                    iconClassName,
                    justCompleted && cn(ENTER, 'zoom-in-75 duration-normal')
                  )}
                />
                <Text
                  as="span"
                  variant="xs"
                  color={textColor}
                  className="min-w-0 leading-5 transition-colors duration-slow [overflow-wrap:anywhere] motion-reduce:transition-none"
                >
                  {item.label}
                  <span className="sr-only">{` (${label})`}</span>
                </Text>
              </li>
            );
          })}
        </ol>
      </ChatToolCallCollapse>
    </section>
  );
}
