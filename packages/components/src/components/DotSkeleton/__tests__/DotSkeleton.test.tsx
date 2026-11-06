import { render, screen } from '@testing-library/react';

import { DotSkeleton } from '../DotSkeleton';

it('renders the default dot matrix with one accessible status', () => {
  const { container } = render(<DotSkeleton />);
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading');
  expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(18);
  expect(container.querySelector('style')).toBeNull();
});

it('supports custom rows and columns with built-in spacing and timing', () => {
  const { container } = render(
    <DotSkeleton rows={1} cols={6} className="text-secondary" />
  );
  expect(screen.getByRole('status')).toHaveStyle({
    gridTemplateColumns: 'repeat(6, 3px)',
    gap: '3px',
  });
  const dots = container.querySelectorAll('[aria-hidden="true"]');
  expect(dots).toHaveLength(6);
  expect(dots[1]).toHaveClass('bg-current');
  expect(dots[1]).toHaveStyle({
    width: '3px',
    height: '3px',
    animationDelay: '0.070s',
    animationDuration: '1.02s',
  });
});
