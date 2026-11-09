import { type ReactNode, useId } from 'react';

import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { ChatToolCallCaret } from './ChatToolCallCaret';
import { ChatToolCallCollapse } from './ChatToolCallCollapse';

interface ChatToolCallAccordionProps {
  heading: ReactNode;
  status: ReactNode;
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
}

export function ChatToolCallAccordion({
  heading,
  status,
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
      <div className="relative flex min-w-0 items-center gap-space-2 rounded-md px-space-1 transition-colors duration-fast hover:bg-surface-level-2 motion-reduce:transition-none">
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
            // The button stretches over the whole row, so the status and the
            // trailing caret are part of the hit area.
            className="static h-auto min-w-0 flex-1 border-0 justify-start gap-space-2 px-0 py-space-1 text-left shadow-none outline-none after:absolute after:inset-0 after:rounded-md hover:bg-transparent focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-focus"
          >
            {heading}
          </Button>
        ) : (
          <span className="flex min-w-0 flex-1 items-center gap-space-2 py-space-1">
            {heading}
          </span>
        )}
        <span className="pointer-events-none relative flex shrink-0 items-center">
          {status}
        </span>
        {hasDetails && <ChatToolCallCaret open={isExpanded} />}
      </div>
      {hasDetails && (
        <ChatToolCallCollapse
          open={isExpanded}
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
