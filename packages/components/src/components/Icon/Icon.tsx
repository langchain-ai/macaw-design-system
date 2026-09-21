import { forwardRef } from 'react';

import { cn } from '../../utils/cn';
import type { VisualElementSize } from '../../utils/componentSizes';
import type { IconComponent, IconWeight } from '../../utils/icon-types';
import type { TooltipProps } from '../Tooltip';
import { Tooltip } from '../Tooltip';

export type { IconComponent } from '../../utils/icon-types';

type IconSize = VisualElementSize | 'lg' | 'xl';

const ICON_GLYPH_SIZE: Record<IconSize, string> = {
  xxs: 'size-3',
  xs: 'size-3',
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
};

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon component to display */
  icon: IconComponent;
  /** Color scheme for the icon */
  color?:
    | 'neutral'
    | 'brand'
    | 'success'
    | 'warning'
    | 'info'
    | 'error'
    | 'special';
  /** Whether the background should be rounded */
  rounded?: boolean;
  /** Optional label - renders a tooltip when provided */
  label?: React.ReactNode;
  /** The size of the icon. Decorated icons also receive the corresponding presentation box. */
  size?: IconSize;
  /** Class name for the icon */
  iconClassName?: string;
  /** Weight used to render the icon */
  weight?: IconWeight;
  /** Tooltip props */
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
}

const Icon = forwardRef<HTMLDivElement, IconProps>(
  (
    {
      icon: IconElement,
      color,
      rounded = false,
      label,
      size = 'md',
      className,
      iconClassName,
      weight,
      tooltipProps,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex flex-shrink-0 items-center justify-center [&_path]:stroke-[1.5px]',
      color && {
        'p-[2px]': size === 'xs',
        'p-space-1': size === 'sm' || size === 'md',
        'p-space-2': size === 'lg',
        'p-space-3': size === 'xl',
      },
      color && {
        'rounded-full': rounded,
        'rounded-md': !rounded,
      }
    );

    const getColorStyles = () => {
      switch (color) {
        case 'success':
          return 'bg-success-subtle text-status-green dark:bg-success';
        case 'warning':
          return 'bg-warning-subtle dark:bg-warning text-status-orange';
        case 'brand':
        case 'info':
          return 'bg-brand-subtle text-brand-primary';
        case 'error':
          return 'bg-error-subtle text-status-red dark:bg-error';
        case 'special':
          return 'bg-ls-acid-50 text-ls-acid-700';
        case 'neutral':
          return 'bg-surface-level-4 text-secondary';
        default:
          return 'text-primary';
      }
    };

    const content = (
      <span
        ref={ref}
        className={cn(baseStyles, getColorStyles(), className)}
        {...props}
      >
        <IconElement
          className={cn(ICON_GLYPH_SIZE[size], 'flex-shrink-0', iconClassName)}
          weight={weight}
        />
      </span>
    );

    if (label) {
      return (
        <Tooltip
          {...tooltipProps}
          title={label}
          side={tooltipProps?.side ?? 'top'}
        >
          {content}
        </Tooltip>
      );
    }

    return content;
  }
);

Icon.displayName = 'Icon';

export { Icon };
