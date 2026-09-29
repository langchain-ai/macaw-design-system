import { describe, expect, it } from 'vitest';

import { render, screen, within } from '../../../test-utils';
import { Slider } from '../Slider';

describe('Slider accessible names', () => {
  it('labels the interactive thumb and preserves keyboard updates', async () => {
    const { user } = render(<Slider defaultValue={30} aria-label="Volume" />);
    const slider = screen.getByRole('slider', { name: 'Volume' });

    await user.tab();
    expect(slider).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '31');
  });

  it.each([
    { 'aria-label': 'Price range' },
    { 'aria-labelledby': 'price-range' },
  ])('names the range while preserving endpoint labels (%j)', (labelProps) => {
    render(
      <>
        <span id="price-range">Price range</span>
        <Slider defaultValue={[20, 80]} {...labelProps} />
      </>
    );

    const range = within(screen.getByRole('group', { name: 'Price range' }));
    expect(range.getByRole('slider', { name: 'Minimum' })).toBeVisible();
    expect(range.getByRole('slider', { name: 'Maximum' })).toBeVisible();
  });

  it('keeps the primitive range labels when no custom name is supplied', () => {
    render(<Slider defaultValue={[20, 80]} />);

    expect(screen.getByRole('slider', { name: 'Minimum' })).toBeVisible();
    expect(screen.getByRole('slider', { name: 'Maximum' })).toBeVisible();
  });
});
