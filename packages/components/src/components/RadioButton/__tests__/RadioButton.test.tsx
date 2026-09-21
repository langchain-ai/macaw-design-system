import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
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

  it('can be checked by clicking', async () => {
    const onValueChange = vi.fn();
    const { user } = render(
      <RadioGroup defaultValue="other" onValueChange={onValueChange}>
        <RadioButton value="test" label="Test" />
        <RadioButton value="other" label="Other" />
      </RadioGroup>
    );

    await user.click(screen.getByText('Test'));
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

  it('does not trigger onValueChange when disabled', async () => {
    const onValueChange = vi.fn();
    const { user } = render(
      <RadioGroup defaultValue="other" onValueChange={onValueChange}>
        <RadioButton value="test" label="Test" disabled />
        <RadioButton value="other" label="Other" />
      </RadioGroup>
    );

    await user.click(screen.getByText('Test'));
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
});
