import { render, screen } from '@testing-library/react';

import { DotSkeleton } from '../DotSkeleton';

it('renders the default dot matrix with one accessible status', () => {
  const { container } = render(<DotSkeleton />);
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading');
  expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(18);
  expect(container.querySelector('style')).toBeNull();
});

it('supports compact cells, custom sizing and staggered timing', () => {
  const { container } = render(
    <DotSkeleton
      rows={1}
      cols={6}
      size={4}
      gap={2}
      step={0.1}
      className="text-secondary"
    />
  );
  expect(screen.getByRole('status')).toHaveStyle({
    gridTemplateColumns: 'repeat(6, 4px)',
    gap: '2px',
  });
  const dots = container.querySelectorAll('[aria-hidden="true"]');
  expect(dots).toHaveLength(6);
  expect(dots[1]).toHaveClass('bg-current');
  expect(dots[1]).toHaveStyle({
    animationDelay: '0.100s',
    animationDuration: '1.2000000000000002s',
  });
});
