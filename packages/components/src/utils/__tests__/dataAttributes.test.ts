import { describe, expect, it } from 'vitest';

import { pickDataAttributes } from '../dataAttributes';

describe('pickDataAttributes', () => {
  it('keeps data attributes and drops every other prop', () => {
    expect(
      pickDataAttributes({
        'data-analytics-id': 'runs-tab-analytics',
        'data-testid': 'runs-tab',
        dataTestId: 'runs-tab',
        onClick: () => {},
        'aria-label': 'Runs',
      })
    ).toEqual({
      'data-analytics-id': 'runs-tab-analytics',
      'data-testid': 'runs-tab',
    });
  });
});
