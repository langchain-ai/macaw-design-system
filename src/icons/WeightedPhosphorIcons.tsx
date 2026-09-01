import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PencilLineIcon } from '@phosphor-icons/react/dist/ssr/PencilLine';
import { PencilSimpleLineIcon } from '@phosphor-icons/react/dist/ssr/PencilSimpleLine';

import type { IconComponent, IconWeight } from '../utils/icon-types';

const createWeightedIcon = (
  Icon: IconComponent,
  weight: IconWeight,
  displayName: string
): IconComponent => {
  const WeightedIcon: IconComponent = (props) => (
    <Icon {...props} weight={weight} />
  );

  WeightedIcon.displayName = displayName;
  return WeightedIcon;
};

export const MagnifyingGlassBoldIcon = /* @__PURE__ */ createWeightedIcon(
  MagnifyingGlassIcon,
  'bold',
  'MagnifyingGlassBoldIcon'
);
export const PencilLineFillIcon = /* @__PURE__ */ createWeightedIcon(
  PencilLineIcon,
  'fill',
  'PencilLineFillIcon'
);
export const PencilSimpleLineFillIcon = /* @__PURE__ */ createWeightedIcon(
  PencilSimpleLineIcon,
  'fill',
  'PencilSimpleLineFillIcon'
);
