import { describe, expect, it } from 'vitest';

import { render, screen } from '../../test-utils';
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
          weight="bold"
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
});
