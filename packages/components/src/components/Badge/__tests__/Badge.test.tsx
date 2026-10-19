import { createRef } from 'react';

import { render, screen } from '@testing-library/react';

import { Badge } from '../Badge';

describe('Badge', () => {
  it('includes the suffix in the badge content with a spoken separator', () => {
    render(
      <Badge role="status" suffix="12">
        Ready
      </Badge>
    );

    expect(screen.getByRole('status')).toHaveTextContent('Ready, 12');
    expect(screen.getByText('12')).toBeVisible();
  });

  it('forwards the ref to the inline root that receives DOM props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} data-testid="badge" className="custom-badge">
        Ready
      </Badge>
    );
    const root = screen.getByTestId('badge');
    expect(ref.current).toBe(root);
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveClass('custom-badge');
    expect(root).toHaveTextContent('Ready');
  });
});
