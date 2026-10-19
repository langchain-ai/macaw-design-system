import * as React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { cn } from '../../utils/cn';
import { SELECTION_CONTROL_HIT_AREA_STYLES } from '../../utils/componentSizes';

export type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
>;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'gap-space-3 border-subtle bg-surface-level-1 p-space-3 data-[disabled]:border-disabled data-[disabled]:bg-disabled data-[disabled]:data-[state=checked]:bg-disabled data-[state=checked]:bg-brand data-[state=checked]:p-space-2 flex items-start justify-end self-stretch rounded-full border transition-colors data-[disabled]:cursor-not-allowed',
        'focus-visible:shadow-[0_0_0_4px_var(--bg-brand-subtle)] focus-visible:outline-none',
        SELECTION_CONTROL_HIT_AREA_STYLES,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="group flex items-center justify-center">
        <div className="bg-control-thumb group-data-[disabled]:bg-control-disabled size-2 rounded-full" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroupItem };
