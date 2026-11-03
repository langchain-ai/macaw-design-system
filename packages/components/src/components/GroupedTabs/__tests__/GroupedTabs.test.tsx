import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../test-utils';
import { GroupedTabs } from '../GroupedTabs';

describe('GroupedTabs', () => {
  it('forwards data attributes to the group, not to each option', () => {
    render(
      <GroupedTabs
        value="table"
        onChange={() => {}}
        options={[
          { value: 'table', display: 'Table' },
          { value: 'chart', display: 'Chart' },
        ]}
        data-testid="view-mode"
      />
    );

    const group = screen.getByTestId('view-mode');
    expect(group).toContainElement(
      screen.getByRole('button', { name: 'Table' })
    );
    expect(group).toContainElement(
      screen.getByRole('button', { name: 'Chart' })
    );
  });
});
