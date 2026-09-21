import { createRef } from 'react';

import { render, screen } from '@testing-library/react';

import { Badge } from '../Badge';

describe('Badge', () => {
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
