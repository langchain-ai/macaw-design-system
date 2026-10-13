import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';

export interface CodeToolbarProps {
  language?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function CodeToolbar({
  language,
  children,
  className,
}: CodeToolbarProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center justify-end border-b border-subtle px-space-2 py-space-1',
        className
      )}
    >
      <div className="min-w-0">{language}</div>
      {children && (
        <div className="flex shrink-0 items-center gap-space-1">{children}</div>
      )}
    </div>
  );
}
