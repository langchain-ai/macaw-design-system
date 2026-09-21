import type { ReactNode } from 'react';
import { useId } from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '../../utils/cn';
import {
  SELECTION_CONTROL_HIT_AREA_STYLES,
  SELECTION_CONTROL_SIZES,
  type SelectionControlSize,
} from '../../utils/componentSizes';
import { Text } from '../Text';

interface SwitchBaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  /** Track height. The pointer target remains at least 24px. */
  size?: SelectionControlSize;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

interface SwitchWithLabelProps extends SwitchBaseProps {
  label: string;
  labelClassName?: string;
  labelPosition?: 'left' | 'right';
  'aria-label'?: never;
  'aria-labelledby'?: never;
}

interface SwitchWithAriaLabelProps extends SwitchBaseProps {
  'aria-label': string;
  label?: never;
  labelClassName?: never;
  labelPosition?: never;
  'aria-labelledby'?: never;
}

interface SwitchWithAriaLabelledByProps extends SwitchBaseProps {
  'aria-labelledby': string;
  label?: never;
  labelClassName?: never;
  labelPosition?: never;
  'aria-label'?: never;
}

export type SwitchProps =
  | SwitchWithLabelProps
  | SwitchWithAriaLabelProps
  | SwitchWithAriaLabelledByProps;

const ROOT_SIZE_CLASSES: Record<
  NonNullable<SwitchBaseProps['size']>,
  string
> = {
  sm: `${SELECTION_CONTROL_SIZES.sm.heightClassName} w-8`,
  md: `${SELECTION_CONTROL_SIZES.md.heightClassName} w-10`,
};

const THUMB_SIZE_CLASSES: Record<
  NonNullable<SwitchBaseProps['size']>,
  string
> = {
  sm: 'size-3 data-[state=checked]:translate-x-[18px]',
  md: 'size-4 data-[state=checked]:translate-x-[22px]',
};

/**
 * `flex` collapses the label's inherited line box to the text it wraps, so the
 * row's `items-center` aligns the label against the switch instead of against a
 * taller, invisible line box.
 */
const SwitchLabel = ({
  htmlFor,
  size,
  labelClassName,
  children,
}: {
  htmlFor: string;
  size: SwitchProps['size'];
  labelClassName?: string;
  children: ReactNode;
}) => (
  <label htmlFor={htmlFor} className="flex items-center">
    <Text as="span" variant={size ?? 'sm'} className={labelClassName}>
      {children}
    </Text>
  </label>
);

export const Switch = ({
  checked,
  onChange,
  id,
  className,
  size,
  disabled,
  onClick,
  label,
  labelClassName,
  labelPosition = 'right',
  ...rest
}: SwitchProps) => {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <div className={cn('flex items-center gap-space-2', className)}>
      {labelPosition === 'left' && label && (
        <SwitchLabel
          htmlFor={switchId}
          size={size}
          labelClassName={labelClassName}
        >
          {label}
        </SwitchLabel>
      )}

      <SwitchPrimitive.Root
        className={cn(
          'inline-flex items-center rounded-full bg-surface-level-4 transition',
          'focus-visible:shadow-[0_0_0_4px_var(--bg-brand-subtle)] focus-visible:outline-none',
          SELECTION_CONTROL_HIT_AREA_STYLES,
          disabled
            ? 'cursor-not-allowed data-[state=checked]:bg-brand-subtle'
            : 'data-[state=checked]:bg-control-active hover:data-[state=checked]:bg-control-active-hover',
          ROOT_SIZE_CLASSES[size ?? 'sm']
        )}
        id={switchId}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'translate-x-[2px] rounded-full bg-control-thumb transition',
            THUMB_SIZE_CLASSES[size ?? 'sm'],
            disabled &&
              'bg-disabled data-[state=checked]:bg-control-thumb dark:data-[state=checked]:bg-disabled'
          )}
        />
      </SwitchPrimitive.Root>

      {labelPosition === 'right' && label && (
        <SwitchLabel
          htmlFor={switchId}
          size={size}
          labelClassName={labelClassName}
        >
          {label}
        </SwitchLabel>
      )}
    </div>
  );
};
