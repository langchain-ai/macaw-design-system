import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@radix-ui/react-tooltip';
// oxlint-disable-next-line custom/prefer-test-utils -- Design-system test intentionally avoids app-level providers.
import { render, screen, waitFor } from '@testing-library/react';

import { ChartLegend, type ChartLegendItem } from '../ChartLegend';

const items: readonly ChartLegendItem[] = [
  { id: 'alpha', label: 'Alpha', selected: false },
  { id: 'bravo', label: 'Bravo', selected: true },
  { id: 'charlie', label: 'Charlie', selected: false },
];

describe('ChartLegend', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        constructor(
          private readonly callback: (
            entries: Array<{ contentRect: { width: number } }>
          ) => void
        ) {}

        observe() {
          this.callback([{ contentRect: { width: 100 } }]);
        }

        disconnect() {}

        unobserve() {}
      }
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.getAttribute('role') === 'group' ? 100 : 0;
      }
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.textContent?.startsWith('+') ? 20 : 50;
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps selected overflow items in their input position', async () => {
    render(
      <TooltipProvider>
        <ChartLegend items={items} onItemClick={vi.fn()} />
      </TooltipProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Bravo' })
    ).not.toBeInTheDocument();
  });
});
