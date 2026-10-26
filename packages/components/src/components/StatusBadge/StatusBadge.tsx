import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';

import type { IconComponent } from '../../utils/icon-types';
import { Badge, type BadgeProps } from '../Badge';

/** How a state reads: fine, needs attention, broken, or neither. */
export type StatusBadgeVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

const VARIANTS: Record<
  StatusBadgeVariant,
  { color: NonNullable<BadgeProps['color']>; icon?: IconComponent }
> = {
  neutral: { color: 'secondary' },
  info: { color: 'primary' },
  success: { color: 'success', icon: CheckCircleIcon },
  warning: { color: 'warning', icon: WarningIcon },
  error: { color: 'error', icon: WarningCircleIcon },
};

/** Badge's text-label heights: xxs/xs=16px, sm=20px, md=24px. */
export type StatusBadgeSize = NonNullable<BadgeProps['size']>;

export interface StatusBadgeProps {
  /** How the state reads. Defaults to `neutral`. */
  variant?: StatusBadgeVariant;
  /**
   * Replaces the variant's icon; `null` drops it. Success, warning, and error
   * carry one by default.
   */
  icon?: IconComponent | null;
  /**
   * Badge height; the icon and text scale with it. Defaults to `xs` (16px),
   * which sits beside a title or in a row.
   */
  size?: StatusBadgeSize;
  children: string;
  className?: string;
}

/**
 * A short state beside a title, such as Active, Expires in 3 days, or
 * Failed, colored and marked by how it reads.
 */
export function StatusBadge({
  variant = 'neutral',
  icon,
  size = 'xs',
  children,
  className,
}: StatusBadgeProps) {
  const { color, icon: variantIcon } = VARIANTS[variant];
  return (
    <Badge
      color={color}
      size={size}
      rounded="xs"
      leftDecorator={icon === null ? undefined : (icon ?? variantIcon)}
      iconWeight="regular"
      className={className}
    >
      {children}
    </Badge>
  );
}
