import { describe, expect, it } from 'vitest';

import { HeatmapBlock, HeatmapChart } from '..';
import { render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';

describe('HeatmapChart', () => {
  it('exposes each matrix cell with its coordinates and value', () => {
    render(<HeatmapChart data={[[0, 100], [50]]} aria-label="Experiments" />);
    const chart = screen.getByRole('group', { name: 'Experiments' });
    expect(within(chart).getAllByRole('img')).toHaveLength(3);
    expect(
      within(chart).getByRole('img', { name: 'Row 1, column 1: 0%' })
    ).toBeVisible();
    expect(
      within(chart).getByRole('img', { name: 'Row 2, column 1: 50%' })
    ).toBeVisible();
  });

  it('uses consumer labels for cell context', () => {
    render(
      <HeatmapChart
        data={[[75]]}
        getBlockLabel={(value) => `Accuracy: ${value}%`}
      />
    );
    expect(screen.getByRole('img', { name: 'Accuracy: 75%' })).toBeVisible();
  });

  it('supports an empty matrix', () => {
    render(<HeatmapChart data={[]} />);
    expect(screen.getByRole('group', { name: 'Heatmap' })).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('uses one Tab stop and moves between cells with arrow keys, skipping empty rows', async () => {
    const { user } = render(
      <>
        <HeatmapChart data={[[10, 20], [], [30]]} />
        <Button>After heatmap</Button>
      </>
    );
    const first = screen.getByRole('img', { name: 'Row 1, column 1: 10%' });
    const second = screen.getByRole('img', { name: 'Row 1, column 2: 20%' });
    const last = screen.getByRole('img', { name: 'Row 3, column 1: 30%' });

    await user.tab();
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(second).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(last).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(first).toHaveFocus();
    await user.keyboard('{End}');
    expect(second).toHaveFocus();
    await user.keyboard('{Home}');
    expect(first).toHaveFocus();
    await user.keyboard('{Control>}{End}{/Control}');
    expect(last).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After heatmap' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });
});

describe('HeatmapBlock', () => {
  it('shows details on keyboard focus and dismisses them with Escape', async () => {
    const { user } = render(<HeatmapBlock opacity={50} />);
    await user.tab();
    expect(screen.getByRole('img', { name: '50%' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('50%');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows details on hover, including zero values', async () => {
    const { user } = render(<HeatmapBlock opacity={0} />);
    await user.hover(screen.getByRole('img', { name: '0%' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('0%');
  });
});
