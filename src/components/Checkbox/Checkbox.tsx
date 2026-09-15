import { forwardRef, useId } from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { CheckIcon, MinusIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import {
  SELECTION_CONTROL_HIT_AREA_STYLES,
  type SelectionControlSize,
} from '../../utils/componentSizes';
import { Text } from '../Text';
import {
  checkboxBaseStyles,
  checkboxFocusStyles,
  checkboxIconSizes,
  checkboxIndicatorStyles,
  checkboxRootStateStyles,
  checkboxSizeStyles,
} from './constants';

/**
 * Base props shared by all Checkbox variants.
 * Extends Radix CheckboxProps to support all native checkbox functionality.
 */
interface CheckboxBaseProps extends Omit<
  CheckboxPrimitive.CheckboxProps,
  'asChild'
> {
  /** Visual indicator size. The pointer target remains at least 24px. */
  size?: SelectionControlSize;
  /** Additional CSS classes for the container wrapper */
  containerClassName?: string;
}

/**
 * Props for Checkbox with a visible label.
 */
interface CheckboxWithLabelProps extends CheckboxBaseProps {
  /** Visible label text or React node displayed next to the checkbox */
  label: React.ReactNode;
  /** Additional CSS classes for the label */
  labelClassName?: string;
  'aria-label'?: never;
  'aria-labelledby'?: never;
}

/**
 * Props for Checkbox with aria-label (no visible label).
 */
interface CheckboxWithAriaLabelProps extends CheckboxBaseProps {
  /** Accessible label for screen readers when no visible label is present */
  'aria-label': string;
  label?: never;
  labelClassName?: never;
  'aria-labelledby'?: never;
}

/**
 * Props for Checkbox with aria-labelledby (labeled by external element).
 */
interface CheckboxWithAriaLabelledByProps extends CheckboxBaseProps {
  /** ID of an element that labels this checkbox */
  'aria-labelledby': string;
  label?: never;
  labelClassName?: never;
  'aria-label'?: never;
}

/**
 * Checkbox component props.
 *
 * For accessibility compliance (WCAG 2.1), checkboxes must have an accessible name.
 * This is enforced at the type level by requiring one of:
 * - `label`: A visible label displayed next to the checkbox
 * - `aria-label`: An accessible label for screen readers (when no visible label)
 * - `aria-labelledby`: Reference to an external labeling element
 *
 * @see https://www.w3.org/WAI/tutorials/forms/labels/
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
export type CheckboxProps =
  | CheckboxWithLabelProps
  | CheckboxWithAriaLabelProps
  | CheckboxWithAriaLabelledByProps;

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked,
      label,
      className,
      containerClassName,
      labelClassName,
      disabled,
      size = 'sm',
      id,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
      <div className={cn('flex items-center gap-space-2', containerClassName)}>
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            checkboxBaseStyles,
            checkboxFocusStyles,
            SELECTION_CONTROL_HIT_AREA_STYLES,
            checkboxSizeStyles[size],
            checkboxRootStateStyles,
            className
          )}
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          {...rest}
        >
          <CheckboxPrimitive.Indicator
            className={cn(
              'flex items-center justify-center',
              disabled
                ? checkboxIndicatorStyles.disabled
                : checkboxIndicatorStyles.enabled
            )}
          >
            {checked === 'indeterminate' ? (
              <MinusIcon
                aria-hidden
                size={checkboxIconSizes[size]}
                weight="regular"
              />
            ) : (
              <CheckIcon
                aria-hidden
                size={checkboxIconSizes[size]}
                weight="regular"
              />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && (
          <label
            htmlFor={checkboxId}
            // `flex` collapses the label's inherited line box to the text it
            // wraps, so the row's `items-center` aligns the label against the
            // box instead of against a taller, invisible line box.
            className={cn(
              'flex cursor-pointer items-center',
              disabled && 'cursor-not-allowed'
            )}
          >
            <Text
              variant="sm"
              className={labelClassName}
              color={disabled ? 'tertiary' : undefined}
            >
              {label}
            </Text>
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
