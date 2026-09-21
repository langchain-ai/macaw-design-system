import { describe, expect, it } from 'vitest';

import { render, screen } from '@/test-utils';

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckIcon,
  DotsSixVerticalIcon,
  MinusIcon,
  PlusIcon,
  XCloseIcon,
  XIcon,
} from '../PaddedPhosphorIcons';

const paddedIcons = [
  { name: 'arrow down', icon: ArrowDownIcon, viewBox: '-32 -32 320 320' },
  { name: 'arrow right', icon: ArrowRightIcon, viewBox: '-32 -32 320 320' },
  { name: 'arrow up', icon: ArrowUpIcon, viewBox: '-32 -32 320 320' },
  {
    name: 'double right caret',
    icon: CaretDoubleRightIcon,
    viewBox: '-64 -64 384 384',
  },
  { name: 'down caret', icon: CaretDownIcon, viewBox: '-64 -64 384 384' },
  { name: 'right caret', icon: CaretRightIcon, viewBox: '-64 -64 384 384' },
  { name: 'up caret', icon: CaretUpIcon, viewBox: '-64 -64 384 384' },
  { name: 'check', icon: CheckIcon, viewBox: '-32 -32 320 320' },
  {
    name: 'drag handle',
    icon: DotsSixVerticalIcon,
    viewBox: '-48 -48 352 352',
  },
  { name: 'minus', icon: MinusIcon, viewBox: '-40 -40 336 336' },
  { name: 'plus', icon: PlusIcon, viewBox: '-40 -40 336 336' },
  { name: 'close', icon: XCloseIcon, viewBox: '-40 -40 336 336' },
  { name: 'x', icon: XIcon, viewBox: '-64 -64 384 384' },
] as const;

describe('PaddedPhosphorIcons', () => {
  it.each(paddedIcons)(
    'preserves the $name outer size while padding its artwork',
    ({ name, icon: PaddedIcon, viewBox }) => {
      render(
        <PaddedIcon
          role="img"
          aria-label={name}
          className="custom-icon"
          size={20}
          weight="regular"
        />
      );

      const icon = screen.getByRole('img', { name });
      expect(icon).toBeVisible();
      expect(icon).toHaveAttribute('viewBox', viewBox);
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
      expect(icon).toHaveClass('custom-icon');
    }
  );

  it('adds the extra-bold optical treatment only to compact bold glyphs', () => {
    render(
      <>
        <CaretRightIcon aria-label="Bold caret" weight="bold" />
        <CaretRightIcon aria-label="Regular caret" weight="regular" />
        <XCloseIcon aria-label="Bold close" weight="bold" />
      </>
    );

    expect(screen.getByLabelText('Bold caret')).toHaveAttribute(
      'stroke-width',
      '8'
    );
    expect(screen.getByLabelText('Bold caret')).toHaveAttribute(
      'stroke',
      'currentColor'
    );
    expect(screen.getByLabelText('Regular caret')).not.toHaveAttribute(
      'stroke-width'
    );
    expect(screen.getByLabelText('Bold close')).toHaveAttribute(
      'stroke-width',
      '8'
    );
  });

  it('forwards custom stroke props for ordinary and extra-bold padded icons', () => {
    render(
      <>
        <ArrowDownIcon
          aria-label="Custom arrow"
          stroke="purple"
          strokeWidth={3}
          strokeLinecap="butt"
          strokeLinejoin="bevel"
          weight="regular"
        />
        <CaretRightIcon
          aria-label="Custom bold caret"
          stroke="orange"
          strokeWidth={2}
          strokeLinecap="square"
          strokeLinejoin="miter"
          weight="bold"
        />
      </>
    );

    expect(screen.getByLabelText('Custom arrow')).toHaveAttribute(
      'stroke',
      'purple'
    );
    expect(screen.getByLabelText('Custom arrow')).toHaveAttribute(
      'stroke-width',
      '3'
    );
    expect(screen.getByLabelText('Custom arrow')).toHaveAttribute(
      'stroke-linecap',
      'butt'
    );
    expect(screen.getByLabelText('Custom arrow')).toHaveAttribute(
      'stroke-linejoin',
      'bevel'
    );
    expect(screen.getByLabelText('Custom bold caret')).toHaveAttribute(
      'stroke',
      'orange'
    );
    expect(screen.getByLabelText('Custom bold caret')).toHaveAttribute(
      'stroke-width',
      '2'
    );
    expect(screen.getByLabelText('Custom bold caret')).toHaveAttribute(
      'stroke-linecap',
      'square'
    );
    expect(screen.getByLabelText('Custom bold caret')).toHaveAttribute(
      'stroke-linejoin',
      'miter'
    );
  });
});
