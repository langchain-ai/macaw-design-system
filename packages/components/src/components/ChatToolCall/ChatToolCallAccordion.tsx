import type { ReactNode } from 'react';

import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';

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
  const hasDetails = children != null && children !== false;
  const [expandedState = false, setExpanded] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });
  const isExpanded = hasDetails && expandedState;

  return (
    <Collapsible open={isExpanded} onOpenChange={setExpanded} asChild>
      <div
        role="group"
        aria-label={groupLabel}
        className={cn(
          'min-w-0 max-w-full font-sans text-xxs text-secondary',
          className
        )}
      >
        <div className="flex flex-wrap items-center gap-space-2 rounded-md px-space-1 transition-colors duration-fast hover:bg-surface-level-2 motion-reduce:transition-none">
          {hasDetails ? (
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="plain"
                color="secondary"
                size="sm"
                aria-label={triggerLabel}
                aria-describedby={triggerDescriptionId}
                className="h-auto min-w-0 flex-1 justify-start gap-space-2 bg-transparent px-0 py-space-1 text-left shadow-none hover:bg-transparent"
              >
                <CaretRightIcon
                  size={12}
                  weight="regular"
                  aria-hidden="true"
                  className={cn(
                    'shrink-0 text-icon-tertiary transition-transform duration-normal motion-reduce:transition-none',
                    isExpanded && 'rotate-90'
                  )}
                />
                {heading}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-space-2 py-space-1 pl-space-5">
              {heading}
            </span>
          )}
          {status}
        </div>
        {hasDetails && (
          <CollapsibleContent
            role="region"
            aria-label={detailsLabel}
            className={cn(
              'ml-space-2 min-w-0 border-l border-subtle py-space-2 pl-space-4 text-tertiary',
              detailsClassName
            )}
          >
            {children}
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
