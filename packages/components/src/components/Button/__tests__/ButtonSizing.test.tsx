import { describe, expect, it } from 'vitest';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { screen } from '@testing-library/react';

import { render as lsRender } from '../../../test-utils';
import { IconButton } from '../../IconButton';
import { Button } from '../Button';

const hasHeightUtility = (element: HTMLElement) =>
  element.className
    .split(/\s+/)
    .some((className) => /^(?:h|min-h|max-h)-/.test(className));

describe('Button sizing', () => {
  it.each([
    ['xs', 'leading-type-xs'],
    ['sm', 'leading-type-sm'],
    ['md', 'leading-type-md'],
  ] as const)(
    'derives the %s height from line-height and padding',
    (size, lineHeightClassName) => {
      lsRender(<Button size={size}>{size}</Button>);

      const button = screen.getByRole('button', { name: size });
      expect(button).toHaveClass(lineHeightClassName, 'py-0.5');
      expect(hasHeightUtility(button)).toBe(false);
      expect(button.children).toHaveLength(1);
    }
  );
});

describe('IconButton sizing', () => {
  it.each([
    ['xxs', 'leading-type-xs', 'py-0.5', 'w-4'],
    ['xs', 'leading-type-xs', 'py-0.5', 'w-5'],
    ['sm', 'leading-type-sm', 'py-0.5', 'w-5'],
    ['md', 'leading-type-md', 'py-0.5', 'w-6'],
  ] as const)(
    'derives the %s height without a height utility',
    (size, lineHeightClassName, paddingClassName, widthClassName) => {
      lsRender(
        <IconButton
          size={size}
          icon={MagnifyingGlassIcon}
          label={`${size} search`}
        />
      );

      const button = screen.getByRole('button', { name: `${size} search` });
      expect(button).toHaveClass(
        lineHeightClassName,
        paddingClassName,
        widthClassName
      );
      expect(hasHeightUtility(button)).toBe(false);
      expect(button.children).toHaveLength(1);
    }
  );
});
