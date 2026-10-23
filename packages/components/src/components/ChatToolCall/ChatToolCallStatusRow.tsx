import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';

interface ChatToolCallStatusRowProps {
  heading: ReactNode;
  status: ReactNode;
  groupLabel: string;
  onInspect?: () => void;
  className?: string;
}

export function ChatToolCallStatusRow({
  heading,
  status,
  groupLabel,
  onInspect,
  className,
}: ChatToolCallStatusRowProps) {
  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-space-2 py-space-1">
        {heading}
      </span>
      {status}
    </>
  );

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn(
        'min-w-0 max-w-full font-sans text-xxs text-secondary',
        className
      )}
    >
      {onInspect ? (
        <Tooltip title="Click to view detailed trace">
          <Button
            type="button"
            size="xs"
            variant="plain"
            color="secondary"
            aria-label={`${groupLabel}: Click to view detailed trace`}
            onClick={onInspect}
            className="focus-visible:ring-focus flex h-auto w-full flex-wrap items-center gap-space-1 rounded-md border-0 px-space-1 py-0 text-left transition-colors duration-fast hover:bg-surface-level-2 focus-visible:outline-hidden focus-visible:ring-2 motion-reduce:transition-none dark:hover:bg-surface-level-2"
          >
            {content}
          </Button>
        </Tooltip>
      ) : (
        <div className="flex flex-wrap items-center gap-space-1 rounded-md px-space-1 transition-colors duration-fast hover:bg-surface-level-2 motion-reduce:transition-none">
          {content}
        </div>
      )}
    </div>
  );
}
