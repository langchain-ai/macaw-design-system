import type { ReactNode } from 'react';

import { Text } from '../components/Text/Text';
import { CONTROL_SIZES } from '../utils/componentSizes';
import type { ControlSize } from '../utils/componentSizes';

interface ControlVariantGridProps<Variant extends string> {
  variants: { value: Variant; label: string }[];
  children: (variant: Variant) => ReactNode;
}

export function ControlVariantGrid<Variant extends string>({
  variants,
  children,
}: ControlVariantGridProps<Variant>) {
  return (
    <div className="grid w-[48rem] max-w-full grid-cols-1 gap-space-6 sm:grid-cols-2">
      {variants.map(({ value, label }) => (
        <div key={value} className="flex min-w-0 flex-col gap-space-5">
          <Text as="h3" weight="medium">
            {label}
          </Text>
          {children(value)}
        </div>
      ))}
    </div>
  );
}

interface ControlSizeMatrixProps<Variant extends string> {
  variants: ControlVariantGridProps<Variant>['variants'];
  children: (size: ControlSize, variant: Variant) => ReactNode;
}

export function ControlSizeMatrix<Variant extends string>({
  variants,
  children,
}: ControlSizeMatrixProps<Variant>) {
  return (
    <ControlVariantGrid variants={variants}>
      {(variant) =>
        Object.values(CONTROL_SIZES).map(({ name }) => (
          <div key={name} className="flex min-w-0 flex-col gap-space-2">
            <Text variant="xs" color="secondary">
              {name}
            </Text>
            {children(name, variant)}
          </div>
        ))
      }
    </ControlVariantGrid>
  );
}
