import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils/cn';

export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** Leading content, such as a title, description, breadcrumbs, or tabs. */
  start?: ReactNode;
  /** Trailing content, such as page actions, filters, or status. */
  end?: ReactNode;
}

/** A page header with a growing start slot and an end-aligned action slot. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  ({ start, end, className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'flex min-h-12 min-w-0 flex-wrap items-center gap-space-4 border-b border-subtle bg-surface-level-1 px-space-5 py-space-3',
        className
      )}
      {...props}
    >
      {start != null && (
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-space-2">
          {start}
        </div>
      )}
      {end != null && (
        <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-space-2">
          {end}
        </div>
      )}
    </header>
  )
);

PageHeader.displayName = 'PageHeader';
