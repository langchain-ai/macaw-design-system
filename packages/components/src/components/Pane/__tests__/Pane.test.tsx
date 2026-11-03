import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../test-utils';
import { Pane } from '../Pane';

describe('Pane', () => {
  it('forwards data attributes to the dialog element', () => {
    render(
      <Pane
        open
        onClose={() => {}}
        title="Pane title"
        data-analytics-id="example-pane"
      >
        Pane body
      </Pane>
    );

    expect(screen.getByRole('dialog', { name: 'Pane title' })).toHaveAttribute(
      'data-analytics-id',
      'example-pane'
    );
  });
});
