import { cn } from '../../utils/cn';
import { CONTROL_SIZES, type ControlSize } from '../../utils/componentSizes';

export type InputSize = ControlSize;
export type InputVariant = 'outlined' | 'plain';

export const INPUT_HORIZONTAL_PADDING_CLASSES: Record<InputSize, string> = {
  xs: 'px-space-1',
  sm: 'px-space-2',
  md: 'px-space-3',
  lg: 'px-space-3',
};

export const INPUT_RADIUS_CLASSES: Record<InputSize, string> = {
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-md',
};

export const INPUT_TEXT_CLASSES: Record<InputSize, string> = {
  xs: 'text-xxs leading-[1.15]',
  sm: 'text-xs',
  md: 'text-sm leading-normal',
  lg: 'text-sm leading-normal',
};

/**
 * Shared styling for input containers (border, padding, rounding, variant).
 * Used by both the design system Input and CommandInput.
 */
export function getInputContainerClasses({
  size,
  variant,
  isError = false,
  disabled = false,
  className,
}: {
  size: InputSize;
  variant: InputVariant;
  isError?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const outlined = variant === 'outlined';
  return cn(
    'box-border flex w-full items-center gap-space-2 transition-[border-color,box-shadow,background-color]',
    CONTROL_SIZES[size].heightClassName,
    INPUT_HORIZONTAL_PADDING_CLASSES[size],
    INPUT_RADIUS_CLASSES[size],
    'focus-within:outline-none',
    {
      'border border-subtle bg-transparent': variant === 'outlined',
      'border border-transparent bg-surface-level-3': variant === 'plain',
    },
    outlined &&
      !disabled &&
      !isError &&
      '[&:hover:not(:focus-within)]:border-default',
    !isError &&
      (outlined
        ? 'focus-within:border-focus focus-within:shadow-[0_0_0_1px_var(--border-focus)]'
        : 'focus-within:border-focus'),
    isError &&
      (outlined
        ? 'border-error-strong focus-within:border-error-strong focus-within:shadow-[0_0_0_1px_var(--border-error-strong)]'
        : 'border-error-strong focus-within:border-error-strong'),
    disabled && 'cursor-not-allowed bg-disabled opacity-50',
    className
  );
}

/**
 * Shared styling for the inner input element (unstyled, fills container).
 * Used by both the design system Input and CommandInput.
 */
export function getInputElementClasses({
  size,
  disabled = false,
  className,
}: {
  size: InputSize;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    'min-w-0 max-w-full flex-1 border-none bg-transparent p-0 outline-none',
    INPUT_TEXT_CLASSES[size],
    'placeholder:text-placeholder',
    disabled && 'cursor-not-allowed',
    className
  );
}

/** Shared styling for decorator wrappers. */
export const DECORATOR_CLASSES = 'flex items-center text-tertiary';
