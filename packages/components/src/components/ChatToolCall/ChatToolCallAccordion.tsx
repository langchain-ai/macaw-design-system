import { type ReactNode, useId } from 'react';

import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatToolCallCaret } from './ChatToolCallCaret';
import { ChatToolCallCollapse } from './ChatToolCallCollapse';

const SWAP_TRANSITION =
  'transition-[opacity,scale] duration-fast ease-out motion-reduce:transition-none';

interface ChatToolCallAccordionProps {
  heading: ReactNode;
  status: ReactNode;
  /** Trailing content before the status, outside the toggle. */
  meta?: ReactNode;
  children: ReactNode;
  groupLabel: string;
  triggerLabel: string;
  triggerDescriptionId?: string;
  detailsLabel: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
  detailsClassName?: string;
  keepMounted?: boolean;
}

export function ChatToolCallAccordion({
  heading,
  status,
  meta,
  children,
  groupLabel,
  triggerLabel,
  triggerDescriptionId,
  detailsLabel,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
  detailsClassName,
  keepMounted,
}: ChatToolCallAccordionProps) {
  const detailsId = useId();
  const hasDetails = children != null && children !== false;
  const [expandedState = false, setExpanded] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });
  const isExpanded = hasDetails && expandedState;

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn(
        'min-w-0 max-w-full font-sans text-xxs text-secondary',
        className
      )}
    >
      <div className="group/row relative flex min-w-0 items-center gap-space-2 rounded-md px-space-1 transition-colors duration-fast hover:bg-surface-level-2 motion-reduce:transition-none">
        {hasDetails ? (
          <Button
            type="button"
            variant="plain"
            color="secondary"
            size="sm"
            aria-label={triggerLabel}
            aria-describedby={triggerDescriptionId}
            aria-controls={detailsId}
            aria-expanded={isExpanded}
            onClick={() => setExpanded(!isExpanded)}
            // Stretched over the row so the status and caret are clickable too.
            className="static h-auto min-w-0 flex-1 border-0 justify-start gap-space-2 px-0 py-space-1 text-left shadow-none outline-none after:absolute after:inset-0 after:rounded-md hover:bg-transparent focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-focus"
          >
            {heading}
          </Button>
        ) : (
          <span className="flex min-w-0 flex-1 items-center gap-space-2 py-space-1">
            {heading}
          </span>
        )}
        {meta != null && (
          // Raised above the stretched toggle so links and buttons stay clickable.
          <span className="relative z-[1] flex min-w-0 shrink-0 items-center gap-space-1 text-tertiary">
            {meta}
          </span>
        )}
        {/* Status and caret share the trailing slot: status at rest, caret on
            hover or keyboard focus. */}
        <span className="pointer-events-none relative grid shrink-0 items-center justify-items-end *:col-start-1 *:row-start-1">
          <span
            className={cn(
              'flex items-center',
              SWAP_TRANSITION,
              hasDetails &&
                'group-hover/row:scale-90 group-hover/row:opacity-0 group-has-[:focus-visible]/row:scale-90 group-has-[:focus-visible]/row:opacity-0'
            )}
          >
            {status}
          </span>
          {hasDetails && (
            <ChatToolCallCaret
              open={isExpanded}
              className={cn(
                SWAP_TRANSITION,
                'scale-90 opacity-0 group-hover/row:scale-100 group-hover/row:opacity-100 group-has-[:focus-visible]/row:scale-100 group-has-[:focus-visible]/row:opacity-100'
              )}
            />
          )}
        </span>
      </div>
      {hasDetails && (
        <ChatToolCallCollapse
          open={isExpanded}
          keepMounted={keepMounted}
          id={detailsId}
          role="region"
          aria-label={detailsLabel}
          className={cn(
            'min-w-0 py-space-2 pl-space-5 pr-space-1 text-tertiary',
            detailsClassName
          )}
        >
          {children}
        </ChatToolCallCollapse>
      )}
    </div>
  );
}
