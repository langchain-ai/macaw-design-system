import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { render, screen } from '@testing-library/react';

import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('shows its label', () => {
    render(<StatusBadge variant="warning">Expires in 3 days</StatusBadge>);
    expect(screen.getByText('Expires in 3 days')).toBeVisible();
  });

  it('marks success, warning, and error with an icon by default', () => {
    const { container } = render(
      <StatusBadge variant="success">Active</StatusBadge>
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has no icon for neutral or info unless one is given', () => {
    const { container, rerender } = render(<StatusBadge>Owner</StatusBadge>);
    expect(container.querySelector('svg')).not.toBeInTheDocument();

    rerender(
      <StatusBadge variant="info" icon={ClockIcon}>
        Scheduled
      </StatusBadge>
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('drops the default icon when icon is null', () => {
    const { container } = render(
      <StatusBadge variant="success" icon={null}>
        Paid
      </StatusBadge>
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('defaults to xs and passes other sizes through, scaling its icon', () => {
    const { rerender } = render(
      <StatusBadge variant="success">Active</StatusBadge>
    );
    const badge = () => screen.getByText('Active').parentElement!;
    expect(badge()).toHaveClass('h-4');
    expect(badge().querySelector('svg')).toHaveClass('size-3');

    rerender(
      <StatusBadge variant="success" size="sm">
        Active
      </StatusBadge>
    );
    expect(badge()).toHaveClass('h-5');

    rerender(
      <StatusBadge variant="success" size="md">
        Active
      </StatusBadge>
    );
    expect(badge()).toHaveClass('h-6');
    expect(badge().querySelector('svg')).toHaveClass('size-4');
  });
});
