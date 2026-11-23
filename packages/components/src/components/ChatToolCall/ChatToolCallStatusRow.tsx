import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';

interface ChatToolCallStatusRowProps {
  heading: ReactNode;
  status: ReactNode;
  /** Trailing content before the status, outside the inspect button. */
  meta?: ReactNode;
  groupLabel: string;
  onInspect?: () => void;
  inspectLabel?: string;
  className?: string;
}

export function ChatToolCallStatusRow({
  heading,
  status,
  meta,
  groupLabel,
  onInspect,
  inspectLabel = 'View tool details',
  className,
}: ChatToolCallStatusRowProps) {
  const headingContent = (
    <span className="flex min-w-0 flex-1 items-center gap-space-2 py-space-1">
      {heading}
    </span>
  );
  const trailing = meta != null && (
    <span className="flex min-w-0 shrink-0 items-center gap-space-1 text-tertiary">
      {meta}
    </span>
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
        <div className="flex min-w-0 items-center gap-space-1">
          <Tooltip title={inspectLabel}>
            <Button
              type="button"
              size="xs"
              variant="plain"
              color="secondary"
              aria-label={`${groupLabel}: ${inspectLabel}`}
              onClick={onInspect}
              className="focus-visible:ring-focus flex h-auto w-full min-w-0 flex-1 flex-wrap items-center gap-space-1 rounded-md border-0 px-space-1 py-0 text-left transition-colors duration-fast hover:bg-surface-level-2 focus-visible:outline-hidden focus-visible:ring-2 motion-reduce:transition-none dark:hover:bg-surface-level-2"
            >
              {headingContent}
              {status}
            </Button>
          </Tooltip>
          {/* Outside the inspect button so interactive metadata stays valid. */}
          {trailing}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-space-1 rounded-md px-space-1 transition-colors duration-fast hover:bg-surface-level-2 motion-reduce:transition-none">
          {headingContent}
          {trailing}
          {status}
        </div>
      )}
    </div>
  );
}
