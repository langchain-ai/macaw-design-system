import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { RadioGroup } from '../RadioGroup';
import { RadioGroupItem } from '../RadioGroupItem';

describe('RadioGroup', () => {
  it('renders options and reflects defaultValue as checked', () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem value="a" aria-label="Option A" data-testid="a" />
        <RadioGroupItem value="b" aria-label="Option B" data-testid="b" />
      </RadioGroup>
    );

    expect(screen.getByTestId('a')).toHaveAttribute('data-state', 'unchecked');
    expect(screen.getByTestId('b')).toHaveAttribute('data-state', 'checked');
  });

  it('fires onValueChange with the clicked item value', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="b" onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="Option A" data-testid="a" />
        <RadioGroupItem value="b" aria-label="Option B" data-testid="b" />
      </RadioGroup>
    );

    fireEvent.click(screen.getByTestId('a'));
    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('does not fire onValueChange when the group is disabled', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="b" disabled onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="Option A" data-testid="a" />
        <RadioGroupItem value="b" aria-label="Option B" data-testid="b" />
      </RadioGroup>
    );

    expect(screen.getByTestId('a')).toBeDisabled();
    fireEvent.click(screen.getByTestId('a'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not fire onValueChange when an individual item is disabled', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="b" onValueChange={onValueChange}>
        <RadioGroupItem
          value="a"
          aria-label="Option A"
          data-testid="a"
          disabled
        />
        <RadioGroupItem value="b" aria-label="Option B" data-testid="b" />
      </RadioGroup>
    );

    fireEvent.click(screen.getByTestId('a'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('merges custom className onto the group and item', () => {
    render(
      <RadioGroup defaultValue="a" className="group-custom" data-testid="group">
        <RadioGroupItem
          value="a"
          aria-label="Option A"
          className="item-custom"
          data-testid="a"
        />
      </RadioGroup>
    );

    expect(screen.getByTestId('group')).toHaveClass('group-custom');
    expect(screen.getByTestId('a')).toHaveClass('item-custom');
  });
});
