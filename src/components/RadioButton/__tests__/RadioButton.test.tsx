import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { RadioGroup } from '../../RadioGroup/RadioGroup';
import { RadioButton } from '../RadioButton';

describe('RadioButton', () => {
  it('renders with label', () => {
    render(
      <RadioGroup defaultValue="test">
        <RadioButton value="test" label="Test Label" />
      </RadioGroup>
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with aria-label (no visible label)', () => {
    render(
      <RadioGroup defaultValue="test">
        <RadioButton
          value="test"
          aria-label="Select option"
          data-testid="radio"
        />
      </RadioGroup>
    );
    expect(screen.getByTestId('radio')).toBeInTheDocument();
    expect(screen.getByTestId('radio')).toHaveAttribute(
      'aria-label',
      'Select option'
    );
  });

  it('can be checked by clicking', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="other" onValueChange={onValueChange}>
        <RadioButton value="test" label="Test" />
        <RadioButton value="other" label="Other" />
      </RadioGroup>
    );

    fireEvent.click(screen.getByText('Test'));
    expect(onValueChange).toHaveBeenCalledWith('test');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(
      <RadioGroup defaultValue="test">
        <RadioButton
          value="test"
          label="Disabled"
          disabled
          data-testid="radio"
        />
      </RadioGroup>
    );
    expect(screen.getByTestId('radio')).toBeDisabled();
  });

  it('does not trigger onValueChange when disabled', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="other" onValueChange={onValueChange}>
        <RadioButton value="test" label="Test" disabled />
        <RadioButton value="other" label="Other" />
      </RadioGroup>
    );

    fireEvent.click(screen.getByText('Test'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <RadioGroup defaultValue="test">
        <RadioButton
          value="test"
          label="Test"
          className="custom-class"
          data-testid="radio"
        />
      </RadioGroup>
    );
    // The className is applied to the container div, which is the parent of the radio button
    expect(
      screen.getByTestId('radio').closest('.custom-class')
    ).toBeInTheDocument();
  });

  it('renders in different sizes', () => {
    const { rerender } = render(
      <RadioGroup defaultValue="test">
        <RadioButton value="test" size="sm" label="Small" data-testid="radio" />
      </RadioGroup>
    );
    expect(screen.getByTestId('radio')).toHaveClass('size-[16px]');

    rerender(
      <RadioGroup defaultValue="test">
        <RadioButton
          value="test"
          size="md"
          label="Medium"
          data-testid="radio"
        />
      </RadioGroup>
    );
    expect(screen.getByTestId('radio')).toHaveClass('size-[20px]');
  });
});
