import { render, screen, within } from '../../../test-utils';
import { Card } from '../Card';

describe('Card', () => {
  it('renders its content and forwards accessible attributes', () => {
    render(
      <Card role="region" aria-label="Usage summary">
        Usage content
      </Card>
    );

    const card = screen.getByRole('region', { name: 'Usage summary' });
    expect(card).toBeVisible();
    expect(within(card).getByText('Usage content')).toBeVisible();
  });
});
