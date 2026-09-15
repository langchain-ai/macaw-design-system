import { AlarmIcon } from '@phosphor-icons/react/dist/ssr/Alarm';
import { ArticleIcon } from '@phosphor-icons/react/dist/ssr/Article';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { ChartLineUpIcon } from '@phosphor-icons/react/dist/ssr/ChartLineUp';
import { ChatsIcon } from '@phosphor-icons/react/dist/ssr/Chats';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';
import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { FileCodeIcon } from '@phosphor-icons/react/dist/ssr/FileCode';
import { GridFourIcon } from '@phosphor-icons/react/dist/ssr/GridFour';
import { HourglassIcon } from '@phosphor-icons/react/dist/ssr/Hourglass';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { LinkBreakIcon } from '@phosphor-icons/react/dist/ssr/LinkBreak';
import { LockIcon } from '@phosphor-icons/react/dist/ssr/Lock';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PauseIcon } from '@phosphor-icons/react/dist/ssr/Pause';
import { PencilLineIcon } from '@phosphor-icons/react/dist/ssr/PencilLine';
import { PencilSimpleLineIcon } from '@phosphor-icons/react/dist/ssr/PencilSimpleLine';
import { PlayIcon } from '@phosphor-icons/react/dist/ssr/Play';
import { PlayCircleIcon } from '@phosphor-icons/react/dist/ssr/PlayCircle';
import { ShieldStarIcon } from '@phosphor-icons/react/dist/ssr/ShieldStar';
import { SidebarSimpleIcon } from '@phosphor-icons/react/dist/ssr/SidebarSimple';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/ssr/SquaresFour';
import { StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { WarningOctagonIcon } from '@phosphor-icons/react/dist/ssr/WarningOctagon';

import type { IconComponent, IconWeight } from '../utils/icon-types';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretUpIcon,
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

const createMirroredWeightedIcon = (
  Icon: IconComponent,
  weight: IconWeight,
  displayName: string
): IconComponent => {
  const WeightedIcon: IconComponent = (props) => (
    <Icon {...props} weight={weight} mirrored />
  );

  WeightedIcon.displayName = displayName;
  return WeightedIcon;
};

export const ArticleRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ArticleIcon,
  'regular',
  'ArticleRegularIcon'
);
export const ArrowDownBoldIcon = /* @__PURE__ */ createWeightedIcon(
  ArrowDownIcon,
  'bold',
  'ArrowDownBoldIcon'
);
export const ArrowLeftRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ArrowLeftIcon,
  'regular',
  'ArrowLeftRegularIcon'
);
export const ArrowUpBoldIcon = /* @__PURE__ */ createWeightedIcon(
  ArrowUpIcon,
  'bold',
  'ArrowUpBoldIcon'
);
export const CaretDoubleRightRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CaretDoubleRightIcon,
  'regular',
  'CaretDoubleRightRegularIcon'
);
/** @knipignore Used by homebase-frontend through the shared source alias. */
export const CaretDownBoldIcon = /* @__PURE__ */ createWeightedIcon(
  CaretDownIcon,
  'bold',
  'CaretDownBoldIcon'
);
export const CaretLeftRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CaretLeftIcon,
  'regular',
  'CaretLeftRegularIcon'
);
export const CaretUpRegularIcon = /* @__PURE__ */ createWeightedIcon(
  CaretUpIcon,
  'regular',
  'CaretUpRegularIcon'
);
export const FileCodeFillIcon = /* @__PURE__ */ createWeightedIcon(
  FileCodeIcon,
  'fill',
  'FileCodeFillIcon'
);
export const LinkBreakRegularIcon = /* @__PURE__ */ createWeightedIcon(
  LinkBreakIcon,
  'regular',
  'LinkBreakRegularIcon'
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
export const AlarmFillIcon = /* @__PURE__ */ createWeightedIcon(
  AlarmIcon,
  'fill',
  'AlarmFillIcon'
);
export const ChartBarFillIcon = /* @__PURE__ */ createWeightedIcon(
  ChartBarIcon,
  'fill',
  'ChartBarFillIcon'
);
export const ChartLineUpRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ChartLineUpIcon,
  'regular',
  'ChartLineUpRegularIcon'
);
export const ChatsFillIcon = /* @__PURE__ */ createWeightedIcon(
  ChatsIcon,
  'fill',
  'ChatsFillIcon'
);
export const CheckCircleFillIcon = /* @__PURE__ */ createWeightedIcon(
  CheckCircleIcon,
  'fill',
  'CheckCircleFillIcon'
);
export const DatabaseFillIcon = /* @__PURE__ */ createWeightedIcon(
  DatabaseIcon,
  'fill',
  'DatabaseFillIcon'
);
export const EnvelopeFillIcon = /* @__PURE__ */ createWeightedIcon(
  EnvelopeIcon,
  'fill',
  'EnvelopeFillIcon'
);
export const GridFourFillIcon = /* @__PURE__ */ createWeightedIcon(
  GridFourIcon,
  'fill',
  'GridFourFillIcon'
);
export const HourglassFillIcon = /* @__PURE__ */ createWeightedIcon(
  HourglassIcon,
  'fill',
  'HourglassFillIcon'
);
export const KeyFillIcon = /* @__PURE__ */ createWeightedIcon(
  KeyIcon,
  'fill',
  'KeyFillIcon'
);
export const LockFillIcon = /* @__PURE__ */ createWeightedIcon(
  LockIcon,
  'fill',
  'LockFillIcon'
);
export const PauseFillIcon = /* @__PURE__ */ createWeightedIcon(
  PauseIcon,
  'fill',
  'PauseFillIcon'
);
export const PlayCircleFillIcon = /* @__PURE__ */ createWeightedIcon(
  PlayCircleIcon,
  'fill',
  'PlayCircleFillIcon'
);
export const PlayFillIcon = /* @__PURE__ */ createWeightedIcon(
  PlayIcon,
  'fill',
  'PlayFillIcon'
);
export const ShieldStarFillIcon = /* @__PURE__ */ createWeightedIcon(
  ShieldStarIcon,
  'fill',
  'ShieldStarFillIcon'
);
export const SparkleFillIcon = /* @__PURE__ */ createWeightedIcon(
  SparkleIcon,
  'fill',
  'SparkleFillIcon'
);
export const SquaresFourFillIcon = /* @__PURE__ */ createWeightedIcon(
  SquaresFourIcon,
  'fill',
  'SquaresFourFillIcon'
);
export const StarFillIcon = /* @__PURE__ */ createWeightedIcon(
  StarIcon,
  'fill',
  'StarFillIcon'
);
export const UserFillIcon = /* @__PURE__ */ createWeightedIcon(
  UserIcon,
  'fill',
  'UserFillIcon'
);
export const WarningFillIcon = /* @__PURE__ */ createWeightedIcon(
  WarningIcon,
  'fill',
  'WarningFillIcon'
);
/** @knipignore Used by homebase-frontend through the shared source alias. */
export const WarningRegularIcon = /* @__PURE__ */ createWeightedIcon(
  WarningIcon,
  'regular',
  'WarningRegularIcon'
);
export const WarningOctagonFillIcon = /* @__PURE__ */ createWeightedIcon(
  WarningOctagonIcon,
  'fill',
  'WarningOctagonFillIcon'
);
export const MagnifyingGlassRegularIcon = /* @__PURE__ */ createWeightedIcon(
  MagnifyingGlassIcon,
  'regular',
  'MagnifyingGlassRegularIcon'
);
export const ArrowDownRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ArrowDownIcon,
  'regular',
  'ArrowDownRegularIcon'
);
export const ArrowRightRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ArrowRightIcon,
  'regular',
  'ArrowRightRegularIcon'
);
export const ArrowUpRegularIcon = /* @__PURE__ */ createWeightedIcon(
  ArrowUpIcon,
  'regular',
  'ArrowUpRegularIcon'
);
export const SidebarSimpleRightRegularIcon =
  /* @__PURE__ */ createMirroredWeightedIcon(
    SidebarSimpleIcon,
    'regular',
    'SidebarSimpleRightRegularIcon'
  );

export {
  CaretRightRegularIcon,
  BinaryRegularIcon,
  BriefcaseRegularIcon,
  BuildingsRegularIcon,
  CarRegularIcon,
  CaretDownRegularIcon,
  CaretUpDownRegularIcon,
  ChatCenteredDotsRegularIcon,
  ClockCounterClockwiseRegularIcon,
  CodepenLogoRegularIcon,
  CodepenLogoFillIcon,
  CpuRegularIcon,
  CubeRegularIcon,
  CursorFillIcon,
  DivideRegularIcon,
  EqualsRegularIcon,
  FileMagnifyingGlassRegularIcon,
  FlagRegularIcon,
  GearRegularIcon,
  GearSixRegularIcon,
  GearSixFillIcon,
  GlobeRegularIcon,
  ImageRegularIcon,
  InfinityRegularIcon,
  InfoFillIcon,
  InfoRegularIcon,
  LaptopRegularIcon,
  ListBulletsRegularIcon,
  MinusRegularIcon,
  MoonRegularIcon,
  PackageRegularIcon,
  PackageFillIcon,
  PushPinRegularIcon,
  RepeatRegularIcon,
  ShieldRegularIcon,
  SignOutRegularIcon,
  SlidersHorizontalRegularIcon,
  StackRegularIcon,
  SquaresFourRegularIcon,
  StarRegularIcon,
  SunRegularIcon,
  TagRegularIcon,
  ToggleLeftRegularIcon,
  WrenchRegularIcon,
} from './LongTailPhosphorIcons';

/** @deprecated Prefer MagnifyingGlassRegularIcon for new UI. */
export const MagnifyingGlassBoldIcon = /* @__PURE__ */ createWeightedIcon(
  MagnifyingGlassIcon,
  'bold',
  'MagnifyingGlassBoldIcon'
);
