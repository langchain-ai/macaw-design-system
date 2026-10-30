import {
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  cloneElement,
  isValidElement,
  MouseEvent,
} from 'react';

import { cn } from '../../utils/cn';
import { makeComponentName } from '../../utils/componentUtils';
import type { IconComponent } from '../../utils/icon-types';
import { Badge } from '../Badge';
import { Spinner } from '../Spinner';
import { Text } from '../Text';
import { buttonStyleMap } from './constants';

type ButtonSize = 'xs' | 'sm' | 'md';

const COMPONENT_NAME = makeComponentName('Button');

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;

  /** Typography tier used to derive the button's intrinsic height. */
  size?: ButtonSize;
  /** Button color scheme */
  color?: 'primary' | 'secondary' | 'error';
  /** Button visual variant */
  variant?: 'normal' | 'outlined' | 'plain' | 'underlined';

  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /** Icon component to display on the left side */
  leftDecorator?: IconComponent;
  /** Icon component to display on the right side */
  rightDecorator?: IconComponent;

  loading?: boolean;
  disabled?: boolean;

  /** Tag text to display */
  tagText?: string;
  /** Position of the tag */
  tagPosition?: 'left' | 'right';
  /** @deprecated Button content */
  children: ReactNode;

  /** Pass through the `<button>` props to a child component */
  as?: ReactElement<{ children: ReactNode;[key: string]: unknown }>;
}

const Button = ({
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
  ref,
  ...props
}: ButtonProps) => {
  const baseStyles = cn(
    "lc-button relative box-border inline-flex flex-none items-center justify-center gap-1.5 truncate py-0.5 transition-all duration-200 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-['']",
    {
      'text-xxs leading-type-xs tracking-normal': size === 'xs',
      'text-xs leading-type-sm tracking-snug': size === 'sm',
      'text-sm leading-type-md tracking-tighter': size === 'md',
    },
    {
      'px-space-2': variant !== 'underlined',
      'px-0': variant === 'underlined',
    },
    {
      'shadow-[0px_1px_2px_0px_var(--shadow-color-subtle)]':
        (variant === 'normal' || variant === 'outlined') && !disabled,
      'active:scale-[0.97] active:brightness-95 motion-reduce:active:scale-100':
        !disabled,
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

  const spinnerElement = <Spinner size={size === 'xs' ? 'xxs' : 'xs'} />;

  if (as) {
    if (!isValidElement(as)) return null;

    return cloneElement(as, {
      className: cn(baseStyles, getColorVariantStyles(), className),
      'data-component': COMPONENT_NAME,
      onClick,
      'aria-label': getAriaLabel(),
      'aria-disabled': disabled || undefined,
      ref,
      ...props,
      children: loading ? (
        <>
          <span className="invisible flex items-center">{content}</span>
          <span className="absolute">{spinnerElement}</span>
        </>
      ) : (
        content
      ),
    });
  }

  return (
    <button
      data-component={COMPONENT_NAME}
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
          <span className="absolute">{spinnerElement}</span>
        </>
      ) : (
        content
      )}
    </button>
  );
};

Button.displayName = COMPONENT_NAME;

export { Button };
export type { ButtonProps };
