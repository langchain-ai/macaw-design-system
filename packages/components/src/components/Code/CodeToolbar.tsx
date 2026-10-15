import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Text } from '../Text';

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
        'gap-space-1 border-subtle px-space-3 py-space-1 flex min-w-0 items-center justify-between border-b',
        className
      )}
    >
      <Text as="div" variant="xs" color="secondary" className="min-w-0">
        {language}
      </Text>
      {children && (
        <div className="gap-space-1 flex shrink-0 items-center">{children}</div>
      )}
    </div>
  );
}
