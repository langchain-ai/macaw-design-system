import { type ReactNode, useId } from 'react';

import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatState } from '../ChatState';
import { Text } from '../Text';
import { ChatToolCallCaret } from './ChatToolCallCaret';
import { ChatToolCallCollapse } from './ChatToolCallCollapse';
import {
  ChatToolCallGroupContext,
  useGroupRows,
} from './ChatToolCallGroupContext';
import { ChatToolCallIcon } from './ChatToolCallIcon';

export interface ChatToolCallGroupProps {
  /**
   * Hosts supply the count/summary and group only consecutive content. To
   * summarize a whole turn, use a label such as
   * `Worked for ${formatChatDuration(ms)} · 6 actions`.
   */
  label: string;
  children: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Show elapsed time beside the header's indicator while a row runs. */
  showElapsed?: boolean;
  /** Host-measured duration for the header timer. */
  elapsedMs?: number;
  /**
   * Wall-clock start of the grouped work, such as the turn's first event. The
   * header timer counts from it, so it keeps counting across remounts.
   */
  startedAt?: Date | number;
  className?: string;
}

export function ChatToolCallGroup({
  label,
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  showElapsed = false,
  elapsedMs,
  startedAt,
  className,
}: ChatToolCallGroupProps) {
  const contentId = useId();
  const [isExpanded = false, setExpanded] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });
  const { registry, anyRunning, allSucceeded, icons } = useGroupRows();

  return (
    <div className={cn('min-w-0 max-w-full font-sans text-xxs', className)}>
      <div
        className={cn(
          'relative flex min-w-0 items-center gap-space-2 pr-space-1',
          // Flush left so the first tile's padded glyph lines up with row icons.
          icons.length > 0 ? 'pl-0' : 'pl-space-1'
        )}
      >
        <Button
          type="button"
          variant="plain"
          color="secondary"
          size="sm"
          aria-label={label}
          aria-controls={contentId}
          aria-expanded={isExpanded}
          onClick={() => setExpanded(!isExpanded)}
          // Stretched over the header so the whole row toggles the group.
          className="static h-auto min-w-0 flex-1 justify-start gap-space-2 border-0 bg-transparent px-0 py-space-1 text-left shadow-none outline-none after:absolute after:inset-0 after:rounded-md hover:bg-transparent focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-focus"
        >
          {icons.length > 0 && (
            <span aria-hidden="true" className="flex shrink-0 items-center">
              {icons.map((icon, index) => (
                <span
                  key={index}
                  className={cn(
                    'flex size-5 items-center justify-center rounded-[6px] border border-subtle bg-surface-level-2',
                    index > 0 && '-ml-space-1'
                  )}
                >
                  <ChatToolCallIcon>{icon}</ChatToolCallIcon>
                </span>
              ))}
            </span>
          )}
          <span className="flex min-w-0 items-center gap-space-1">
            <Text
              as="span"
              variant="xs"
              color="tertiary"
              className="min-w-0 truncate"
            >
              {label}
            </Text>
            <ChatToolCallCaret open={isExpanded} />
          </span>
        </Button>
        {/* Rows omit success and the running indicator; the header carries them. */}
        {(anyRunning || allSucceeded) && (
          <span className="pointer-events-none relative flex shrink-0 items-center">
            <ChatState
              variant="simple"
              status={anyRunning ? 'streaming' : 'completed'}
              showElapsed={showElapsed && anyRunning}
              elapsedMs={elapsedMs}
              startedAt={startedAt}
            />
          </span>
        )}
      </div>
      <ChatToolCallGroupContext.Provider value={registry}>
        <ChatToolCallCollapse
          open={isExpanded}
          keepMounted
          id={contentId}
          className="flex min-w-0 flex-col gap-0.5"
        >
          {children}
        </ChatToolCallCollapse>
      </ChatToolCallGroupContext.Provider>
    </div>
  );
}
