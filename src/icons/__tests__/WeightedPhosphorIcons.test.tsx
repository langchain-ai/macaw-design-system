import { describe, expect, it } from 'vitest';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PencilLineIcon } from '@phosphor-icons/react/dist/ssr/PencilLine';
import { PencilSimpleLineIcon } from '@phosphor-icons/react/dist/ssr/PencilSimpleLine';

import { render, screen } from '../../test-utils';
import {
  MagnifyingGlassBoldIcon,
  PencilLineFillIcon,
  PencilSimpleLineFillIcon,
} from '../WeightedPhosphorIcons';

const icons = [
  [MagnifyingGlassBoldIcon, MagnifyingGlassIcon, 'bold'],
  [PencilLineFillIcon, PencilLineIcon, 'fill'],
  [PencilSimpleLineFillIcon, PencilSimpleLineIcon, 'fill'],
] as const;

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
});
