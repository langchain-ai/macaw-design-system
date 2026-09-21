import { describe, expect, it } from 'vitest';

import { AlarmIcon } from '@phosphor-icons/react/dist/ssr/Alarm';
import { ArticleIcon } from '@phosphor-icons/react/dist/ssr/Article';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { ChartLineUpIcon } from '@phosphor-icons/react/dist/ssr/ChartLineUp';
import { ChatsIcon } from '@phosphor-icons/react/dist/ssr/Chats';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CodepenLogoIcon } from '@phosphor-icons/react/dist/ssr/CodepenLogo';
import { CpuIcon } from '@phosphor-icons/react/dist/ssr/Cpu';
import { DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';
import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { FileCodeIcon } from '@phosphor-icons/react/dist/ssr/FileCode';
import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { GridFourIcon } from '@phosphor-icons/react/dist/ssr/GridFour';
import { HourglassIcon } from '@phosphor-icons/react/dist/ssr/Hourglass';
import { ImageIcon } from '@phosphor-icons/react/dist/ssr/Image';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { LinkBreakIcon } from '@phosphor-icons/react/dist/ssr/LinkBreak';
import { LockIcon } from '@phosphor-icons/react/dist/ssr/Lock';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
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

import { render, screen } from '@/test-utils';

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretUpIcon,
} from '../PaddedPhosphorIcons';
import {
  ArrowDownBoldIcon,
  ArrowLeftRegularIcon,
  ArrowRightRegularIcon,
  ArticleRegularIcon,
  ArrowUpBoldIcon,
  CaretDoubleRightRegularIcon,
  CaretDownBoldIcon,
  CaretLeftRegularIcon,
  CaretUpRegularIcon,
  FileCodeFillIcon,
  LinkBreakRegularIcon,
  MagnifyingGlassRegularIcon,
  PencilLineFillIcon,
  PencilSimpleLineFillIcon,
  AlarmFillIcon,
  ChartBarFillIcon,
  ChartLineUpRegularIcon,
  ChatsFillIcon,
  CheckCircleFillIcon,
  DatabaseFillIcon,
  EnvelopeFillIcon,
  GridFourFillIcon,
  HourglassFillIcon,
  KeyFillIcon,
  LockFillIcon,
  PauseFillIcon,
  PlayCircleFillIcon,
  PlayFillIcon,
  ShieldStarFillIcon,
  SidebarSimpleRightRegularIcon,
  SparkleFillIcon,
  SquaresFourFillIcon,
  StarFillIcon,
  UserFillIcon,
  WarningFillIcon,
  WarningRegularIcon,
  WarningOctagonFillIcon,
} from '../WeightedPhosphorIcons';
import * as Weighted from '../WeightedPhosphorIcons';

const icons = [
  [ArrowDownBoldIcon, ArrowDownIcon, 'bold'],
  [Weighted.ArrowDownRegularIcon, ArrowDownIcon, 'regular'],
  [ArrowLeftRegularIcon, ArrowLeftIcon, 'regular'],
  [ArrowRightRegularIcon, ArrowRightIcon, 'regular'],
  [ArticleRegularIcon, ArticleIcon, 'regular'],
  [ArrowUpBoldIcon, ArrowUpIcon, 'bold'],
  [Weighted.ArrowUpRegularIcon, ArrowUpIcon, 'regular'],
  [CaretDoubleRightRegularIcon, CaretDoubleRightIcon, 'regular'],
  [CaretDownBoldIcon, CaretDownIcon, 'bold'],
  [CaretLeftRegularIcon, CaretLeftIcon, 'regular'],
  [CaretUpRegularIcon, CaretUpIcon, 'regular'],
  [Weighted.CodepenLogoRegularIcon, CodepenLogoIcon, 'regular'],
  [Weighted.CpuRegularIcon, CpuIcon, 'regular'],
  [FileCodeFillIcon, FileCodeIcon, 'fill'],
  [LinkBreakRegularIcon, LinkBreakIcon, 'regular'],
  [MagnifyingGlassRegularIcon, MagnifyingGlassIcon, 'regular'],
  [PencilLineFillIcon, PencilLineIcon, 'fill'],
  [PencilSimpleLineFillIcon, PencilSimpleLineIcon, 'fill'],
  [AlarmFillIcon, AlarmIcon, 'fill'],
  [ChartBarFillIcon, ChartBarIcon, 'fill'],
  [ChartLineUpRegularIcon, ChartLineUpIcon, 'regular'],
  [ChatsFillIcon, ChatsIcon, 'fill'],
  [CheckCircleFillIcon, CheckCircleIcon, 'fill'],
  [DatabaseFillIcon, DatabaseIcon, 'fill'],
  [EnvelopeFillIcon, EnvelopeIcon, 'fill'],
  [GridFourFillIcon, GridFourIcon, 'fill'],
  [Weighted.GlobeRegularIcon, GlobeIcon, 'regular'],
  [HourglassFillIcon, HourglassIcon, 'fill'],
  [KeyFillIcon, KeyIcon, 'fill'],
  [Weighted.ImageRegularIcon, ImageIcon, 'regular'],
  [LockFillIcon, LockIcon, 'fill'],
  [PauseFillIcon, PauseIcon, 'fill'],
  [Weighted.PackageRegularIcon, PackageIcon, 'regular'],
  [PlayCircleFillIcon, PlayCircleIcon, 'fill'],
  [PlayFillIcon, PlayIcon, 'fill'],
  [ShieldStarFillIcon, ShieldStarIcon, 'fill'],
  [SparkleFillIcon, SparkleIcon, 'fill'],
  [SquaresFourFillIcon, SquaresFourIcon, 'fill'],
  [StarFillIcon, StarIcon, 'fill'],
  [UserFillIcon, UserIcon, 'fill'],
  [WarningFillIcon, WarningIcon, 'fill'],
  [WarningRegularIcon, WarningIcon, 'regular'],
  [WarningOctagonFillIcon, WarningOctagonIcon, 'fill'],
] as const;

const fixedWeightIcons = Object.entries(Weighted).filter(
  ([name]) => !name.startsWith('SidebarSimpleRight')
);

describe('WeightedPhosphorIcons', () => {
  it.each(icons)(
    'keeps the fixed weight when props are forwarded',
    (WeightedIcon, BaseIcon, expectedWeight) => {
      render(
        <>
          <WeightedIcon
            aria-label="Weighted icon"
            className="size-4"
            weight="regular"
          />
          <BaseIcon aria-label="Base icon" weight={expectedWeight} />
        </>
      );

      const svg = screen.getByLabelText('Weighted icon');
      expect(svg).toHaveClass('size-4');
      expect(svg).toHaveAttribute('aria-label', 'Weighted icon');
      expect(svg.innerHTML).toBe(screen.getByLabelText('Base icon').innerHTML);
    }
  );

  it.each(fixedWeightIcons)(
    '%s ignores caller-provided weight overrides',
    (_, WeightedIcon) => {
      render(
        <>
          <WeightedIcon aria-label="Regular request" weight="regular" />
          <WeightedIcon aria-label="Thin request" weight="thin" />
        </>
      );

      expect(screen.getByLabelText('Regular request').innerHTML).toBe(
        screen.getByLabelText('Thin request').innerHTML
      );
    }
  );

  it('keeps the right-facing mirrored variant when props are forwarded', () => {
    render(
      <>
        <SidebarSimpleRightRegularIcon
          aria-label="Weighted icon"
          mirrored={false}
          weight="regular"
        />
        <SidebarSimpleIcon aria-label="Base icon" mirrored weight="regular" />
      </>
    );

    expect(screen.getByLabelText('Weighted icon').innerHTML).toBe(
      screen.getByLabelText('Base icon').innerHTML
    );
  });
});
