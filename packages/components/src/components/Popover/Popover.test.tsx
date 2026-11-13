import { describe, expect, it } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from './Popover';

describe('Popover variants', () => {
  it('inherits content colors through portals and preserves dismissal', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent variant="info">
          Notice
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'bg-brand-subtle',
      'border-brand-subtle'
    );
    expect(screen.getByTestId('arrow')).toHaveClass(
      'fill-[var(--bg-brand-subtle)]',
      'stroke-[var(--border-brand-subtle)]'
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('preserves the default surface and caller overrides', () => {
    const { rerender } = render(
      <Popover defaultOpen>
        <PopoverContent>
          Notice
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'bg-popover',
      'border-subtle'
    );
    expect(screen.getByTestId('arrow')).toHaveClass(
      'fill-popover',
      'stroke-subtle'
    );

    rerender(
      <Popover defaultOpen>
        <PopoverContent
          variant="neutral"
          className="bg-elevated border-default"
        >
          Notice
          <PopoverArrow />
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'bg-elevated',
      'border-default'
    );
    expect(screen.getByRole('dialog')).not.toHaveClass(
      'bg-popover',
      'border-subtle'
    );
  });
});
