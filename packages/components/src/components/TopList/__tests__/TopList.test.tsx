import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as MantineHooks from '@mantine/hooks';
import type * as VisxText from '@visx/text';

import { render, screen, within } from '../../../test-utils';
import { TopList } from '../TopList';
import type { TopListItem } from '../TopList.types';

const resizeObserverDimensions = vi.hoisted(() => ({
  width: 640,
  height: 320,
}));

vi.mock('@mantine/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof MantineHooks>()),
  useResizeObserver: () => [{ current: null }, resizeObserverDimensions],
}));

vi.mock('@visx/text', async (importOriginal) => ({
  ...(await importOriginal<typeof VisxText>()),
  getStringWidth: (text: string) => text.length * 7,
}));

const items: readonly TopListItem[] = [
  { id: 'alpha', label: 'Alpha', value: 12 },
  { id: 'beta', label: 'Beta', value: 30 },
  { id: 'gamma', label: 'Gamma', value: 20 },
];

describe('TopList', () => {
  beforeEach(() => {
    resizeObserverDimensions.width = 640;
    resizeObserverDimensions.height = 320;
  });

  it('renders a descending, limited list with category and value labels', () => {
    render(
      <TopList
        aria-label="Top models"
        items={items}
        limit={2}
        valueAxisLabel="Runs"
      />
    );

    const beta = screen.getByLabelText('Beta: 30');
    const gamma = screen.getByLabelText('Gamma: 20');

    expect(beta).toBeVisible();
    expect(gamma).toBeVisible();
    expect(beta.compareDocumentPosition(gamma)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.queryByLabelText('Alpha: 12')).not.toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeVisible();
    expect(screen.getByText('Gamma')).toBeVisible();
    expect(screen.getByText('Runs')).toBeVisible();
  });

  it('uses IDs for categories so duplicate labels remain separate rows', () => {
    render(
      <TopList
        aria-label="Duplicate labels"
        items={[
          { id: 'first', label: 'Shared', value: 2 },
          { id: 'second', label: 'Shared', value: 1 },
        ]}
      />
    );

    expect(screen.getAllByText('Shared')).toHaveLength(2);
    expect(screen.getByLabelText('Shared: 2')).toBeVisible();
    expect(screen.getByLabelText('Shared: 1')).toBeVisible();
  });

  it('uses the same formatter for visible and accessible value labels', () => {
    render(
      <TopList
        aria-label="Top spend"
        items={[{ id: 'api', label: 'API', value: 42 }]}
        formatValue={(value) => `$${value}.00`}
        valueAxisLabel="Spend"
      />
    );

    expect(screen.getByLabelText('API: $42.00')).toBeVisible();
    expect(screen.getAllByText('$42.00').length).toBeGreaterThan(0);
  });

  it('renders signed values with accessible labels', () => {
    render(
      <TopList
        aria-label="Signed changes"
        items={[
          { id: 'gain', label: 'Gain', value: 30 },
          { id: 'loss', label: 'Loss', value: -12 },
        ]}
      />
    );

    expect(screen.getByLabelText('Gain: 30')).toBeVisible();
    expect(screen.getByLabelText('Loss: -12')).toBeVisible();
  });

  it('reduces automatic value ticks in a narrow container', () => {
    resizeObserverDimensions.width = 256;

    render(
      <TopList
        aria-label="Narrow top models"
        categoryLabelWidth={80}
        items={[
          { id: 'claude', label: 'Claude', value: 2_320 },
          { id: 'gpt', label: 'GPT', value: 1_910 },
          { id: 'gemini', label: 'Gemini', value: 1_520 },
        ]}
      />
    );

    const chart = within(
      screen.getByRole('graphics-document', { name: 'Narrow top models' })
    );
    expect(chart.getByText('1,000')).toBeVisible();
    expect(chart.getByText('2,000')).toBeVisible();
    expect(chart.queryByText('500')).not.toBeInTheDocument();
    expect(chart.queryByText('1,500')).not.toBeInTheDocument();
  });

  it('keeps the full input domain when a semantic row is limited out', () => {
    render(
      <TopList
        aria-label="Limited groups"
        items={[
          { id: 'primary', label: 'Primary', value: 50 },
          { id: 'other', label: 'Other', value: 100 },
        ]}
        sort={(left, right) => {
          if (left.id === 'other') return 1;
          if (right.id === 'other') return -1;
          return right.value - left.value;
        }}
        limit={1}
      />
    );

    expect(screen.getByLabelText('Primary: 50')).toBeVisible();
    expect(screen.queryByLabelText('Other: 100')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByRole('graphics-document', { name: 'Limited groups' })
      ).getByText('100')
    ).toBeVisible();
  });

  it('maps keyboard row activation back to the original item', async () => {
    const onItemActivate = vi.fn();
    const { user } = render(
      <TopList
        aria-label="Actionable models"
        items={items}
        onItemActivate={onItemActivate}
      />
    );
    const beta = screen.getByRole('button', { name: 'Beta: 30' });

    beta.focus();
    await user.keyboard('{Enter}');

    expect(onItemActivate).toHaveBeenCalledWith(items[1], expect.anything());
  });

  it('uses custom accessible labels and maps focus changes to items', async () => {
    const onItemFocus = vi.fn();
    const onItemBlur = vi.fn();
    const { user } = render(
      <TopList
        aria-label="Focusable models"
        items={items}
        getItemAriaLabel={(item) => `Inspect ${item.label}`}
        onItemFocus={onItemFocus}
        onItemBlur={onItemBlur}
      />
    );

    await user.tab();
    expect(screen.getByLabelText('Inspect Beta')).toHaveFocus();
    expect(onItemFocus).toHaveBeenCalledWith(items[1], expect.anything());

    await user.tab();
    expect(screen.getByLabelText('Inspect Gamma')).toHaveFocus();
    expect(onItemBlur).toHaveBeenCalledWith(items[1], expect.anything());
  });

  it('maps pointer movement over a category label to its item', async () => {
    const onItemPointerMove = vi.fn();
    const { user } = render(
      <TopList
        aria-label="Hoverable models"
        items={items}
        onItemPointerMove={onItemPointerMove}
      />
    );

    await user.pointer({ target: screen.getByText('Beta') });

    expect(onItemPointerMove).toHaveBeenCalledWith(items[1], expect.anything());
  });

  it('suppresses rows and their interactions while rendering is paused', async () => {
    const onItemPointerMove = vi.fn();
    const { user } = render(
      <TopList
        aria-label="Resizing models"
        items={items}
        valueAxisLabel="Runs"
        isRendering={false}
        onItemPointerMove={onItemPointerMove}
      />
    );

    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Beta: 30')).not.toBeInTheDocument();
    expect(screen.getByText('Runs')).toBeVisible();

    await user.pointer({
      target: screen.getByRole('img', { name: 'Resizing models' }),
      coords: { clientX: 300, clientY: 120 },
    });
    expect(onItemPointerMove).not.toHaveBeenCalled();
  });

  it('omits rows with non-finite values', () => {
    render(
      <TopList
        aria-label="Finite top list"
        items={[
          ...items,
          { id: 'invalid', label: 'Invalid', value: Number.NaN },
        ]}
      />
    );

    expect(screen.getByText(items[0].label)).toBeVisible();
    expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Invalid/)).not.toBeInTheDocument();
  });

  it('renders an empty chart without row labels', () => {
    render(<TopList aria-label="Empty top list" items={[]} />);

    expect(
      screen.getByRole('graphics-document', { name: 'Empty top list' })
    ).toBeVisible();
    expect(screen.queryByLabelText(/:/)).not.toBeInTheDocument();
  });
});
