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
    const { rerender } = render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent variant="warning">
          Notice
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'bg-warning',
      'border-warning'
    );
    expect(screen.getByTestId('arrow')).toHaveClass('fill-[var(--bg-warning)]');

    rerender(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent variant="success">
          Notice
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'bg-success',
      'border-success'
    );
    expect(screen.getByTestId('arrow')).toHaveClass('fill-[var(--bg-success)]');
    rerender(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent variant="error">
          Notice
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByRole('dialog')).toHaveClass('bg-error', 'border-error');
    expect(screen.getByTestId('arrow')).toHaveClass(
      'fill-[var(--bg-error)]',
      'stroke-[var(--border-error)]'
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
