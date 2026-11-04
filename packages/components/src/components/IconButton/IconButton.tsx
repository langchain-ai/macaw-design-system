import { cloneElement, forwardRef, isValidElement } from 'react';

import { cn } from '../../utils/cn';
import type { IconComponent, IconWeight } from '../../utils/icon-types';
import { buttonStyleMap } from '../Button/constants';
import { Spinner } from '../Spinner';
import type { TooltipProps } from '../Tooltip';
import { Tooltip } from '../Tooltip';

type IconButtonSize = 'xxs' | 'xs' | 'sm' | 'md';

interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> {
  /** Button color scheme */
  color?: 'primary' | 'secondary' | 'error';
  /** Button visual variant */
  variant?: 'normal' | 'outlined' | 'plain';
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should have rounded-full styling */
  round?: boolean;
  /** Icon component to display */
  icon: IconComponent;
  /** Label for the button tooltip and aria-label */
  label: string;
  /** Class name for the icon */
  iconClassName?: string;
  /** Phosphor weight used to render the icon */
  iconWeight?: IconWeight;
  /** Typography tier used to derive the button's intrinsic height. */
  size?: IconButtonSize;
  /** Whether the button is loading */
  loading?: boolean;
  /** Tooltip props */
  tooltipProps?: Omit<TooltipProps, 'children'>;
  /** Pass through the `<button>` props to a child component */
  asChild?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      color = 'primary',
      variant = 'normal',
      onClick,
      disabled = false,
      round = false,
      size = 'sm',
      icon: Icon,
      label,
      className,
      iconClassName,
      iconWeight,
      tooltipProps,
      asChild = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "lc-button relative box-border inline-flex flex-none items-center justify-center px-0 py-0.5 transition-all duration-200 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-['']",
      {
        'leading-type-xs': size === 'xxs' || size === 'xs',
        'leading-type-sm': size === 'sm',
        'leading-type-md': size === 'md',
      },
      {
        'w-4': size === 'xxs',
        'w-5': size === 'xs' || size === 'sm',
        'w-6': size === 'md',
      },
      {
        'shadow-[0px_1px_2px_0px_var(--shadow-color-subtle)]':
          (variant === 'normal' || variant === 'outlined') && !disabled,
        // Apply rounded-full if round prop is true, otherwise use rounded-md
        'rounded-full': round,
        'rounded-xs': !round && (size === 'xxs' || size === 'xs'),
        'rounded-sm': !round && size === 'sm',
        'rounded-md': !round && size === 'md',
      }
    );

    const children = loading ? (
      <Spinner size={size === 'xxs' ? 'xxs' : size === 'md' ? 'sm' : 'xs'} />
    ) : (
      <Icon
        aria-hidden
        className={cn(
          size === 'xxs' && 'size-3',
          (size === 'xs' || size === 'sm') && 'size-4',
          size === 'md' && 'size-5',
          'flex-shrink-0',
          '[&_path]:stroke-[1.5px]',
          iconClassName
        )}
        weight={iconWeight}
      />
    );

    // Generate unique class combinations for each color/variant combination
    // This logic is extracted from the Button component to maintain consistency
    // Generate unique class combinations for each color/variant combination
    const getColorVariantStyles = () => {
      const state = disabled ? 'disabled' : 'enabled';
      const key = `${color}-${variant}-${state}` as keyof typeof buttonStyleMap;
      return buttonStyleMap[key] || '';
    };
    const tooltipTitle =
      tooltipProps && 'title' in tooltipProps ? tooltipProps.title : label;

    if (asChild) {
      if (
        !isValidElement<React.ComponentPropsWithRef<'button'>>(props.children)
      )
        return null;

      return (
        <Tooltip
          {...tooltipProps}
          title={tooltipTitle}
          side={tooltipProps?.side ?? 'top'}
        >
          {cloneElement(props.children, {
            className: cn(baseStyles, getColorVariantStyles(), className),
            disabled,
            onClick,
            'aria-label': label,
            ref,
            ...props,
            children,
          })}
        </Tooltip>
      );
    }

    return (
      <Tooltip
        {...tooltipProps}
        title={tooltipTitle}
        side={tooltipProps?.side ?? 'top'}
      >
        {/* eslint-disable-next-line react/forbid-elements */}
        <button
          ref={ref}
          type="button"
          className={cn(baseStyles, getColorVariantStyles(), className)}
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          {...props}
        >
          {children}
        </button>
      </Tooltip>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };
export type { IconButtonProps };
