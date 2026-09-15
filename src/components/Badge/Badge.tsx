import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { cn } from '../../utils/cn';
import type { IconComponent, IconWeight } from '../../utils/icon-types';
import { Text, type TextProps } from '../Text';

// Only allow string or SVG icon as children
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge style preset */
  variant?: 'default' | 'manifestPreview';
  rounded?: 'full' | 'none' | 'xs' | 'sm';
  /** Badge color scheme */
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning'
    | 'special'
    | 'plain';
  /** Text-label height. */
  size?: 'xxs' | 'xs' | 'sm' | 'md';
  /** Left decorator icon */
  leftDecorator?: IconComponent;

  /** Right decorator icon */
  rightDecorator?: IconComponent;

  /** Phosphor weight used for decorator icons. */
  iconWeight?: IconWeight;

  /** Badge content */
  children?: string | ReactElement<SVGSVGElement>;

  /** Font weight of text content */
  textWeight?: TextProps['weight'];
}

type BadgeSize = NonNullable<BadgeProps['size']>;

/** Exact outer heights: xxs/xs=16px, sm=20px, md=24px. */
const SIZE_BOX_CLASSES: Record<BadgeSize, string> = {
  xxs: 'h-4 gap-space-1 px-space-1',
  xs: 'h-4 gap-space-1 px-space-1',
  sm: 'h-5 gap-space-1 px-space-1',
  md: 'h-6 gap-space-1 px-space-2',
};

const SIZE_TEXT_VARIANT: Record<BadgeSize, 'xs' | 'sm'> = {
  xxs: 'xs',
  xs: 'xs',
  sm: 'sm',
  md: 'sm',
};

const SIZE_DEFAULT_WEIGHT: Record<
  BadgeSize,
  NonNullable<TextProps['weight']>
> = {
  xxs: 'normal',
  xs: 'medium',
  sm: 'medium',
  md: 'medium',
};

const SIZE_ICON_CLASSES: Record<BadgeSize, string> = {
  xxs: 'size-3',
  xs: 'size-3',
  sm: 'size-3',
  md: 'size-4',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      color,
      size,
      rounded = 'full',
      leftDecorator: LeftIcon,
      rightDecorator: RightIcon,
      iconWeight,
      className,
      children,
      textWeight,
      ...props
    },
    ref
  ) => {
    const isString = typeof children === 'string';
    const isManifestPreview = variant === 'manifestPreview';
    const resolvedColor = color ?? (isManifestPreview ? 'plain' : 'secondary');
    const resolvedSize = size ?? (isManifestPreview ? 'sm' : 'md');
    const resolvedTextWeight = textWeight ?? SIZE_DEFAULT_WEIGHT[resolvedSize];
    const baseStyles = cn(
      'box-border inline-flex items-center justify-center border border-transparent',
      SIZE_BOX_CLASSES[resolvedSize],
      {
        // TODO: we're only going to have 2 variants for the rounded prop. need to remove/rename the rounded prop
        'rounded-xs':
          rounded === 'xs' || rounded === 'sm' || rounded === 'none',
        'rounded-full': rounded === 'full',
        border: resolvedColor === 'plain',
      }
    );

    const getColorStyles = () => {
      switch (resolvedColor) {
        case 'primary':
          return 'bg-brand-secondary text-brand-primary';
        case 'success':
          return 'bg-success-secondary text-success-secondary';
        case 'error':
          return 'bg-error-secondary text-error-secondary';
        case 'warning':
          return 'bg-warning-secondary text-warning-secondary';
        case 'special':
          return 'bg-ls-acid-50 text-ls-acid-700 dark:bg-ls-acid-200';
        case 'plain':
          return 'bg-primary text-primary border-secondary';
        case 'secondary':
        default:
          return 'bg-tertiary text-secondary';
      }
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          getColorStyles(),
          isManifestPreview &&
            'min-w-0 max-w-full overflow-hidden whitespace-nowrap [&>span]:truncate',
          isManifestPreview && color == null && 'bg-transparent text-secondary',
          className
        )}
        {...props}
      >
        {LeftIcon && (
          <LeftIcon
            aria-hidden
            className={cn(SIZE_ICON_CLASSES[resolvedSize], 'flex-shrink-0')}
            weight={iconWeight}
          />
        )}
        {isString ? (
          <Text
            as="span"
            variant={SIZE_TEXT_VARIANT[resolvedSize]}
            weight={resolvedTextWeight}
            className="tracking-tight"
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {RightIcon && (
          <RightIcon
            aria-hidden
            className={cn(SIZE_ICON_CLASSES[resolvedSize], 'flex-shrink-0')}
            weight={iconWeight}
          />
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
