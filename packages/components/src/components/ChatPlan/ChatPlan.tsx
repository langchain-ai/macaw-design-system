import { useId, useState } from 'react';

import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CircleIcon } from '@phosphor-icons/react/dist/ssr/Circle';
import { CircleHalfIcon } from '@phosphor-icons/react/dist/ssr/CircleHalf';
import { ListChecksIcon } from '@phosphor-icons/react/dist/ssr/ListChecks';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatToolCallCaret } from '../ChatToolCall/ChatToolCallCaret';
import { ChatToolCallCollapse } from '../ChatToolCall/ChatToolCallCollapse';
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
  /** `drawer` fits `ChatComposer`'s drawer slot above the message input. */
  presentation?: 'block' | 'drawer';
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

const ITEM_PRESENTATIONS = {
  pending: {
    label: 'Pending',
    icon: CircleIcon,
    iconClassName: 'text-icon-tertiary',
    segmentClassName: 'bg-surface-level-3',
  },
  'in-progress': {
    label: 'In progress',
    icon: CircleHalfIcon,
    iconClassName: 'text-icon-brand',
    segmentClassName: 'bg-brand',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircleIcon,
    iconClassName: 'text-icon-success',
    segmentClassName: 'bg-success-strong',
  },
} as const;

/** Beyond this many tasks the segments would be too thin to read; use one bar. */
const MAX_SEGMENTS = 12;

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

function PlanProgress({
  items,
  done,
}: {
  items: readonly ChatPlanItem[];
  done: number;
}) {
  if (items.length > MAX_SEGMENTS) {
    return (
      <span
        aria-hidden="true"
        className="relative h-1 w-14 shrink-0 overflow-hidden rounded-full bg-surface-level-3"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-success-strong transition-[width] duration-slower ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="flex h-1 w-14 shrink-0 gap-0.5">
      {items.map((item) => (
        <span
          key={item.id}
          className={cn(
            'h-full min-w-0.5 flex-1 rounded-full transition-colors duration-slow motion-reduce:transition-none',
            ITEM_PRESENTATIONS[item.status].segmentClassName
          )}
        />
      ))}
    </span>
  );
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
          ? 'px-space-4 py-space-2'
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
        <ListChecksIcon
          size={16}
          weight="regular"
          aria-hidden="true"
          className="shrink-0 text-icon-secondary"
        />
        <Text as="span" variant="xs" weight="medium" className="shrink-0">
          {title}
        </Text>
        <PlanProgress items={items} done={done} />
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
            isDrawer && 'max-h-[40dvh] overflow-y-auto overscroll-contain'
          )}
        >
          {items.map((item) => {
            const {
              icon: StatusIcon,
              iconClassName,
              label,
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
                  size={16}
                  weight={item.status === 'pending' ? 'regular' : 'fill'}
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 shrink-0',
                    iconClassName,
                    justCompleted && cn(ENTER, 'zoom-in-50 duration-normal')
                  )}
                />
                <Text
                  as="span"
                  variant="xs"
                  color={item.status === 'completed' ? 'tertiary' : undefined}
                  weight={item.status === 'in-progress' ? 'medium' : 'normal'}
                  className={cn(
                    'min-w-0 leading-5 transition-colors duration-slow [overflow-wrap:anywhere] motion-reduce:transition-none',
                    item.status === 'completed' && 'line-through'
                  )}
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
