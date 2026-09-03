import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { Link } from '../Link';

const RouterLink = forwardRef<
  HTMLAnchorElement,
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children?: ReactNode;
    to: string;
  }
>(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);

RouterLink.displayName = 'RouterLink';

describe('Link', () => {
  it('renders a native anchor', () => {
    render(<Link href="/docs">View docs</Link>);

    expect(screen.getByRole('link', { name: 'View docs' })).toHaveAttribute(
      'href',
      '/docs'
    );
  });

  it('composes with a routing framework link', () => {
    render(
      <Link as={<RouterLink to="/runs" className="router-link" />}>
        View runs
      </Link>
    );

    const link = screen.getByRole('link', { name: 'View runs' });
    expect(link).toHaveAttribute('href', '/runs');
    expect(link).toHaveClass('router-link');
    expect(link).toHaveClass('group');
  });
});
