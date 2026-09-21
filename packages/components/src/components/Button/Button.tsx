import {
  type ButtonHTMLAttributes,
  type ReactElement,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';

import { cn } from '../../utils/cn';
import { CONTROL_SIZES, type ControlSize } from '../../utils/componentSizes';
import type { IconComponent } from '../../utils/icon-types';
import { Badge } from '../Badge';
import { Spinner } from '../Spinner';
import { Text } from '../Text';
import { buttonStyleMap } from './constants';

type ButtonSize = Exclude<ControlSize, 'lg'>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Exact outer height: xs=20px, sm=24px, md=32px. */
  size?: ButtonSize;
  /** Button color scheme */
  color?: 'primary' | 'secondary' | 'error';
  /** Button visual variant */
  variant?: 'normal' | 'outlined' | 'plain' | 'underlined';
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Icon component to display on the left side */
  leftDecorator?: IconComponent;
  /** Icon component to display on the right side */
  rightDecorator?: IconComponent;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Tag text to display */
  tagText?: string;
  /** Position of the tag */
  tagPosition?: 'left' | 'right';
  /** Button content */
  children: React.ReactNode;
  /** Whether the button is loading */
  loading?: boolean;
  /** Pass through the `<button>` props to a child component */
  as?: ReactElement<{ children: React.ReactNode; [key: string]: unknown }>;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      color = 'primary',
      variant = 'normal',
      size = 'sm',
      onClick,
      leftDecorator: LeftIcon,
      rightDecorator: RightIcon,
      disabled = false,
      tagText,
      tagPosition = 'right',
      className,
      children,
      loading = false,
      as,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'lc-button relative box-border inline-flex flex-none items-center justify-center gap-1.5 truncate transition-all duration-200',
      CONTROL_SIZES[size].heightClassName,
      '[&_*]:[text-box-trim:trim-both]',
      {
        'text-xxs leading-[1.15] tracking-normal': size === 'xs',
        'text-xs leading-tight tracking-snug': size === 'sm',
        'text-sm leading-[1.15] tracking-tighter': size === 'md',
      },
      {
        'px-space-2': variant !== 'underlined',
        'px-0': variant === 'underlined',
      },
      {
        'shadow-[0px_1px_2px_0px_var(--shadow-color-subtle)]':
          (variant === 'normal' || variant === 'outlined') && !disabled,
      },
      variant === 'underlined'
        ? 'rounded-none'
        : size === 'xs'
          ? 'rounded-[3px]'
          : `rounded-${size}`
    );

    // Generate unique class combinations for each color/variant combination
    const getColorVariantStyles = () => {
      const state = disabled ? 'disabled' : 'enabled';
      const key = `${color}-${variant}-${state}` as keyof typeof buttonStyleMap;
      return buttonStyleMap[key] || '';
    };

    // Generate aria-label automatically based on content
    const getAriaLabel = () => {
      if (props['aria-label']) {
        return props['aria-label'];
      }

      // If children is a string, use it as aria-label
      if (typeof children === 'string') {
        return children;
      }
      // If children is not a string but tagText exists, use tagText
      if (tagText) {
        return tagText;
      }

      // Fallback to generic "button"
      return 'button';
    };

    const content = (
      <>
        {LeftIcon && (
          <LeftIcon
            aria-hidden
            className={cn(
              'size-4 flex-shrink-0',
              '[&_path]:stroke-[1.5px]',
              size === 'xs' && 'size-3'
            )}
          />
        )}

        {tagText && tagPosition === 'left' && (
          <Badge
            color={color}
            size={size === 'md' ? 'xs' : 'xxs'}
            rounded="xs"
            className={cn('border-0 py-0', disabled && 'opacity-50')}
          >
            {tagText}
          </Badge>
        )}

        {typeof children === 'string' ? (
          <Text variant={size} weight="normal" as="span">
            {children}
          </Text>
        ) : (
          children
        )}

        {tagText && tagPosition === 'right' && (
          <Badge
            color={color}
            size={size === 'md' ? 'xs' : 'xxs'}
            rounded="xs"
            className={cn('border-0 py-0', disabled && 'opacity-50')}
          >
            {tagText}
          </Badge>
        )}

        {RightIcon && (
          <RightIcon
            aria-hidden
            className={cn(
              'size-4 flex-shrink-0',
              '[&_path]:stroke-[1.5px]',
              size === 'xs' && 'size-3'
            )}
          />
        )}
      </>
    );
    const spinnerSize = size === 'xs' ? 'xxs' : 'xs';

    if (as) {
      if (!isValidElement(as)) return null;

      return cloneElement(as, {
        className: cn(baseStyles, getColorVariantStyles(), className),
        onClick,
        'aria-label': getAriaLabel(),
        'aria-disabled': disabled || undefined,
        ref,
        ...props,
        children: loading ? (
          <>
            <span className="invisible flex items-center">{content}</span>
            <span className="absolute">
              <Spinner size={spinnerSize} />
            </span>
          </>
        ) : (
          content
        ),
      });
    }

    return (
      // eslint-disable-next-line react/forbid-elements
      <button
        ref={ref}
        type="button"
        className={cn(baseStyles, getColorVariantStyles(), className)}
        disabled={disabled}
        onClick={onClick}
        aria-label={getAriaLabel()}
        {...props}
      >
        {loading ? (
          <>
            <span className="invisible flex items-center">{content}</span>
            <span className="absolute">
              <Spinner size={spinnerSize} />
            </span>
          </>
        ) : (
          content
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
