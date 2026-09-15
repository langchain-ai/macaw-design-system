import { BinaryIcon } from '@phosphor-icons/react/dist/ssr/Binary';
import { BriefcaseIcon } from '@phosphor-icons/react/dist/ssr/Briefcase';
import { BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { CarIcon } from '@phosphor-icons/react/dist/ssr/Car';
import { CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import { ChatCenteredDotsIcon } from '@phosphor-icons/react/dist/ssr/ChatCenteredDots';
import { ClockCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ClockCounterClockwise';
import { CodepenLogoIcon } from '@phosphor-icons/react/dist/ssr/CodepenLogo';
import { CpuIcon } from '@phosphor-icons/react/dist/ssr/Cpu';
import { CubeIcon } from '@phosphor-icons/react/dist/ssr/Cube';
import { CursorIcon } from '@phosphor-icons/react/dist/ssr/Cursor';
import { DivideIcon } from '@phosphor-icons/react/dist/ssr/Divide';
import { EqualsIcon } from '@phosphor-icons/react/dist/ssr/Equals';
import { FileMagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/FileMagnifyingGlass';
import { FlagIcon } from '@phosphor-icons/react/dist/ssr/Flag';
import { GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { ImageIcon } from '@phosphor-icons/react/dist/ssr/Image';
import { InfinityIcon } from '@phosphor-icons/react/dist/ssr/Infinity';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { LaptopIcon } from '@phosphor-icons/react/dist/ssr/Laptop';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { MoonIcon } from '@phosphor-icons/react/dist/ssr/Moon';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
import { PushPinIcon } from '@phosphor-icons/react/dist/ssr/PushPin';
import { RepeatIcon } from '@phosphor-icons/react/dist/ssr/Repeat';
import { ShieldIcon } from '@phosphor-icons/react/dist/ssr/Shield';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { SlidersHorizontalIcon } from '@phosphor-icons/react/dist/ssr/SlidersHorizontal';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/ssr/SquaresFour';
import { StackIcon } from '@phosphor-icons/react/dist/ssr/Stack';
import { StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import { SunIcon } from '@phosphor-icons/react/dist/ssr/Sun';
import { TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { ToggleLeftIcon } from '@phosphor-icons/react/dist/ssr/ToggleLeft';
import { WrenchIcon } from '@phosphor-icons/react/dist/ssr/Wrench';

import type { IconComponent, IconWeight } from '../utils/icon-types';
import {
  CaretDownIcon,
  CaretRightIcon,
  MinusIcon,
} from './PaddedPhosphorIcons';

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

/** @knipignore Used by homebase-frontend through the shared source alias. */
export const CaretRightRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CaretRightIcon,
  'regular',
  'CaretRightRegularIcon'
);

export const BinaryRegularIcon = /* @__PURE__ */ createWeightedIcon(
  BinaryIcon,
  'regular',
  'BinaryRegularIcon'
);
export const BriefcaseRegularIcon = /* @__PURE__ */ createWeightedIcon(
  BriefcaseIcon,
  'regular',
  'BriefcaseRegularIcon'
);
export const BuildingsRegularIcon = /* @__PURE__ */ createWeightedIcon(
  BuildingsIcon,
  'regular',
  'BuildingsRegularIcon'
);
export const CarRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CarIcon,
  'regular',
  'CarRegularIcon'
);
export const CaretDownRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CaretDownIcon,
  'regular',
  'CaretDownRegularIcon'
);
export const CaretUpDownRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CaretUpDownIcon,
  'regular',
  'CaretUpDownRegularIcon'
);
export const ChatCenteredDotsRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ChatCenteredDotsIcon,
  'regular',
  'ChatCenteredDotsRegularIcon'
);
/** @knipignore Used by homebase-frontend through the shared source alias. */
export const ClockCounterClockwiseRegularIcon =
  /* @__PURE__ */ createWeightedIcon(
    ClockCounterClockwiseIcon,
    'regular',
    'ClockCounterClockwiseRegularIcon'
  );
export const CodepenLogoRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CodepenLogoIcon,
  'regular',
  'CodepenLogoRegularIcon'
);
export const CodepenLogoFillIcon = /* @__PURE__ */ createWeightedIcon(
  CodepenLogoIcon,
  'fill',
  'CodepenLogoFillIcon'
);
export const CpuRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CpuIcon,
  'regular',
  'CpuRegularIcon'
);
export const CubeRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CubeIcon,
  'regular',
  'CubeRegularIcon'
);
export const CursorFillIcon = /* @__PURE__ */ createWeightedIcon(
  CursorIcon,
  'fill',
  'CursorFillIcon'
);
export const DivideRegularIcon = /* @__PURE__ */ createWeightedIcon(
  DivideIcon,
  'regular',
  'DivideRegularIcon'
);
export const EqualsRegularIcon = /* @__PURE__ */ createWeightedIcon(
  EqualsIcon,
  'regular',
  'EqualsRegularIcon'
);
/** @knipignore Used by homebase-frontend through the shared source alias. */
export const FileMagnifyingGlassRegularIcon =
  /* @__PURE__ */ createWeightedIcon(
    FileMagnifyingGlassIcon,
    'regular',
    'FileMagnifyingGlassRegularIcon'
  );
export const FlagRegularIcon = /* @__PURE__ */ createWeightedIcon(
  FlagIcon,
  'regular',
  'FlagRegularIcon'
);
export const GearRegularIcon = /* @__PURE__ */ createWeightedIcon(
  GearIcon,
  'regular',
  'GearRegularIcon'
);
export const GearSixRegularIcon = /* @__PURE__ */ createWeightedIcon(
  GearSixIcon,
  'regular',
  'GearSixRegularIcon'
);
export const GearSixFillIcon = /* @__PURE__ */ createWeightedIcon(
  GearSixIcon,
  'fill',
  'GearSixFillIcon'
);
export const GlobeRegularIcon = /* @__PURE__ */ createWeightedIcon(
  GlobeIcon,
  'regular',
  'GlobeRegularIcon'
);
export const ImageRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ImageIcon,
  'regular',
  'ImageRegularIcon'
);
export const InfinityRegularIcon = /* @__PURE__ */ createWeightedIcon(
  InfinityIcon,
  'regular',
  'InfinityRegularIcon'
);
export const InfoFillIcon = /* @__PURE__ */ createWeightedIcon(
  InfoIcon,
  'fill',
  'InfoFillIcon'
);
/** @knipignore Used by homebase-frontend through the shared source alias. */
export const InfoRegularIcon = /* @__PURE__ */ createWeightedIcon(
  InfoIcon,
  'regular',
  'InfoRegularIcon'
);
export const LaptopRegularIcon = /* @__PURE__ */ createWeightedIcon(
  LaptopIcon,
  'regular',
  'LaptopRegularIcon'
);
export const ListBulletsRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ListBulletsIcon,
  'regular',
  'ListBulletsRegularIcon'
);
export const MinusRegularIcon = /* @__PURE__ */ createWeightedIcon(
  MinusIcon,
  'regular',
  'MinusRegularIcon'
);
export const MoonRegularIcon = /* @__PURE__ */ createWeightedIcon(
  MoonIcon,
  'regular',
  'MoonRegularIcon'
);
export const PackageRegularIcon = /* @__PURE__ */ createWeightedIcon(
  PackageIcon,
  'regular',
  'PackageRegularIcon'
);
export const PackageFillIcon = /* @__PURE__ */ createWeightedIcon(
  PackageIcon,
  'fill',
  'PackageFillIcon'
);
export const PushPinRegularIcon = /* @__PURE__ */ createWeightedIcon(
  PushPinIcon,
  'regular',
  'PushPinRegularIcon'
);
export const RepeatRegularIcon = /* @__PURE__ */ createWeightedIcon(
  RepeatIcon,
  'regular',
  'RepeatRegularIcon'
);
export const ShieldRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ShieldIcon,
  'regular',
  'ShieldRegularIcon'
);
export const SignOutRegularIcon = /* @__PURE__ */ createWeightedIcon(
  SignOutIcon,
  'regular',
  'SignOutRegularIcon'
);
export const SlidersHorizontalRegularIcon = /* @__PURE__ */ createWeightedIcon(
  SlidersHorizontalIcon,
  'regular',
  'SlidersHorizontalRegularIcon'
);
export const StackRegularIcon = /* @__PURE__ */ createWeightedIcon(
  StackIcon,
  'regular',
  'StackRegularIcon'
);
/** @knipignore Used by homebase-frontend through the shared source alias. */
export const SquaresFourRegularIcon = /* @__PURE__ */ createWeightedIcon(
  SquaresFourIcon,
  'regular',
  'SquaresFourRegularIcon'
);
/** @knipignore Used by homebase-frontend through the shared source alias. */
export const StarRegularIcon = /* @__PURE__ */ createWeightedIcon(
  StarIcon,
  'regular',
  'StarRegularIcon'
);
export const SunRegularIcon = /* @__PURE__ */ createWeightedIcon(
  SunIcon,
  'regular',
  'SunRegularIcon'
);
export const TagRegularIcon = /* @__PURE__ */ createWeightedIcon(
  TagIcon,
  'regular',
  'TagRegularIcon'
);
export const ToggleLeftRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ToggleLeftIcon,
  'regular',
  'ToggleLeftRegularIcon'
);
export const WrenchRegularIcon = /* @__PURE__ */ createWeightedIcon(
  WrenchIcon,
  'regular',
  'WrenchRegularIcon'
);
