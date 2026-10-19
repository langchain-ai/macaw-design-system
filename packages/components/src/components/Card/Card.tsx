import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export type CardIntent = 'plain' | 'neutral' | 'info';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  intent?: CardIntent;
}

const intentClasses: Record<CardIntent, string> = {
  plain: 'border-muted bg-elevated',
  neutral: 'border-muted bg-surface-level-2',
  info: 'border-brand-subtle bg-brand-subtle',
};

/**
 * A content surface that standardizes card color, border, radius, and padding
 * while leaving content and layout to the consuming feature.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ intent = 'neutral', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border p-space-4',
        intentClasses[intent],
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';
