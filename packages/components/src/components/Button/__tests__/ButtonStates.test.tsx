import { describe, expect, it } from 'vitest';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { screen } from '@testing-library/react';

import { render as lsRender } from '../../../test-utils';
import { IconButton } from '../../IconButton';
import { Button } from '../Button';

const pressedClassNames = [
  'active:scale-[0.97]',
  'active:brightness-95',
  'motion-reduce:active:scale-100',
];

describe.each([
  {
    name: 'Button',
    render: (disabled: boolean) =>
      lsRender(<Button disabled={disabled}>Save</Button>),
    accessibleName: 'Save',
  },
  {
    name: 'IconButton',
    render: (disabled: boolean) =>
      lsRender(
        <IconButton
          disabled={disabled}
          icon={MagnifyingGlassIcon}
          label="Search"
        />
      ),
    accessibleName: 'Search',
  },
])('$name pressed state', ({ render, accessibleName }) => {
  it('applies the pressed treatment when enabled', () => {
    render(false);

    expect(screen.getByRole('button', { name: accessibleName })).toHaveClass(
      ...pressedClassNames
    );
  });

  it('does not apply the pressed treatment when disabled', () => {
    render(true);

    const button = screen.getByRole('button', { name: accessibleName });
    pressedClassNames.forEach((className) => {
      expect(button).not.toHaveClass(className);
    });
  });
});
