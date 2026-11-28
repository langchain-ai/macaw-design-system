import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Text } from '../Text';
import NoMatchBackground from './NoMatchBackground.svg?react';

interface ErrorStateProps {
  /** Primary heading. */
  title: string;
  /** Supporting copy below the title. */
  message?: string;
  /** When `404`, renders the illustrated not-found background. */
  status?: number | null;
  /** URL for the default back button (ignored when `action` is set). */
  backTo?: string;
  /** Label for the default back button. Defaults to `'Return to home'`. */
  backLabel?: string;
  /** Custom action node rendered in place of the default back button. */
  action?: ReactNode;
  /** Extra classes for the outer container. */
  className?: string;
  /** Extra classes for the inner content wrapper (e.g. to override top padding). */
  contentClassName?: string;
  /** @deprecated The 404 illustration is always static; this prop has no effect. */
  withoutOverlay?: boolean;
}

export function ErrorState({
  title,
  message,
  status,
  backTo,
  backLabel,
  action,
  className,
  contentClassName,
}: ErrorStateProps) {
  return (
    <div className={cn('relative size-full overflow-hidden', className)}>
      {status === 404 && (
        <div className="absolute left-0 top-64 w-full transform">
          <NoMatchBackground className="size-full text-icon-brand [&_*]:fill-current" />
        </div>
      )}

      <div
        className={cn('relative w-full justify-center pt-64', contentClassName)}
      >
        <div className="flex flex-col items-center justify-center">
          <Text
            variant="h1"
            className="text-center text-3xl text-brand-primary"
          >
            {title}
          </Text>
          {message && (
            <Text
              className="pb-space-5 pt-space-3 text-center font-mono leading-5 text-quaternary"
              variant="body"
            >
              {message}
            </Text>
          )}

          {action}
          {!action && backTo && (
            <Button
              as={<a href={backTo} />}
              variant="normal"
              size="sm"
              color="secondary"
            >
              {backLabel ?? 'Return to home'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export type { ErrorStateProps };
