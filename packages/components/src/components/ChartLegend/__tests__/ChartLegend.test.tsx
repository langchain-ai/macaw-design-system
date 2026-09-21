import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../test-utils';
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

  it('reports pointer and keyboard activity for legend items', async () => {
    const onItemActiveChange = vi.fn();
    const { rerender, user } = render(
      <ChartLegend
        items={items.slice(0, 2)}
        layout="list"
        onItemActiveChange={onItemActiveChange}
      />
    );
    const legend = screen.getByRole('group', { name: 'Chart legend' });
    const alpha = within(legend).getByRole('group', { name: 'Alpha' });
    const bravo = within(legend).getByRole('group', { name: 'Bravo' });

    await user.hover(alpha);
    expect(onItemActiveChange).toHaveBeenLastCalledWith(items[0]);

    await user.unhover(alpha);
    expect(onItemActiveChange).toHaveBeenLastCalledWith(null);

    await user.tab();
    expect(alpha).toHaveFocus();
    expect(onItemActiveChange).toHaveBeenLastCalledWith(items[0]);

    await user.hover(bravo);
    expect(onItemActiveChange).toHaveBeenLastCalledWith(items[1]);
    await user.unhover(bravo);
    expect(onItemActiveChange).toHaveBeenLastCalledWith(items[0]);

    rerender(
      <ChartLegend
        items={[items[0]]}
        layout="list"
        onItemActiveChange={onItemActiveChange}
      />
    );
    await waitFor(() => {
      expect(onItemActiveChange).toHaveBeenLastCalledWith(null);
    });
  });

  it('keeps static legend rows out of the tab order', () => {
    render(<ChartLegend items={items.slice(0, 2)} layout="list" />, {});

    const legend = screen.getByRole('group', { name: 'Chart legend' });
    expect(
      within(legend).queryByRole('group', { name: 'Alpha' })
    ).not.toBeInTheDocument();
    expect(within(legend).getByText('Alpha').closest('[tabindex]')).toBeNull();
  });

  it('keeps selected overflow items in their input position', async () => {
    render(<ChartLegend items={items} onItemClick={vi.fn()} />, {});

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'Bravo' })
    ).not.toBeInTheDocument();
  });
});
