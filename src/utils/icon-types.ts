import type { ComponentType, SVGProps } from 'react';

import type { IconWeight } from '@phosphor-icons/react/dist/lib/types';

export type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & {
    mirrored?: boolean;
    size?: string | number;
    weight?: IconWeight;
  }
>;
export type { IconWeight };
