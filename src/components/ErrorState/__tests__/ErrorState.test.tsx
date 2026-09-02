import { render, screen } from '@testing-library/react';

import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders its default action without a router provider', () => {
    render(
      <ErrorState title="Page not found" backTo="/" backLabel="Return home" />
    );

    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
