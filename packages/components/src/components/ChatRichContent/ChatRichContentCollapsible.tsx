import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';

/** Animates height between 0 and auto; hidden content is inert. */
export function ChatRichContentCollapsible({
  id,
  open,
  disabled = false,
  className,
  children,
}: {
  id?: string;
  open: boolean;
  /** Renders children directly in the parent's layout. */
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (disabled) return children;
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-normal ease-out motion-reduce:transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={cn('flex min-w-0 flex-col gap-space-4', className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
