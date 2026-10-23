import type { ReactNode } from 'react';

import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { WrenchIcon } from '@phosphor-icons/react/dist/ssr/Wrench';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Text } from '../Text';

export interface ChatToolCallGroupProps {
  /** Hosts supply the count/summary and group only consecutive content. */
  label: string;
  children: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export function ChatToolCallGroup({
  label,
  children,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: ChatToolCallGroupProps) {
  const [isExpanded = false, setExpanded] = useControllableState({
    prop: expanded,
    defaultProp: defaultExpanded,
    onChange: onExpandedChange,
  });

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setExpanded}
      className={cn('min-w-0 max-w-full font-sans text-xxs', className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="plain"
          color="secondary"
          size="sm"
          aria-label={label}
          className="h-auto max-w-full justify-start gap-space-2 bg-transparent px-0 py-space-1 text-left shadow-none hover:bg-transparent"
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
          <WrenchIcon
            size={16}
            weight="regular"
            aria-hidden="true"
            className="shrink-0 text-icon-tertiary"
          />
          <Text
            as="span"
            variant="xs"
            color="tertiary"
            className="min-w-0 truncate"
          >
            {label}
          </Text>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent forceMount hidden={!isExpanded}>
        <div className="flex min-w-0 flex-col gap-0 pl-space-5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
