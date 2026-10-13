import { describe, expect, it, vi } from 'vitest';

import type * as MantineHooks from '@mantine/hooks';
import { composeStory } from '@storybook/react-vite';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '../../../test-utils';
import { SankeyChart } from '../SankeyChart';
import storyMeta, { InChartCardWithTooltip } from '../SankeyChart.stories';
import type { SankeyChartNode } from '../SankeyChart.types';

// jsdom does not measure element dimensions.
vi.mock('@mantine/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof MantineHooks>()),
  useResizeObserver: () => [
    { current: null },
    {
      width: 640,
      height: 320,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 320,
      right: 640,
    },
  ],
}));

const nodes: readonly SankeyChartNode[] = [
  { id: 'web', label: 'Web', color: 'var(--chart-categorical-fill-1)' },
  { id: 'sdk', label: 'SDK', color: 'var(--chart-categorical-fill-2)' },
  { id: 'gpt', label: 'GPT-5.6', color: 'var(--chart-categorical-fill-3)' },
];

const links = [
  { sourceId: 'web', targetId: 'gpt', value: 120 },
  { sourceId: 'sdk', targetId: 'gpt', value: 80 },
];

const PinningExample = composeStory(InChartCardWithTooltip, storyMeta);

describe('SankeyChart pinning example', () => {
  it('keeps the pinned tooltip and flows together, replaces the pin, and clears on a second click', async () => {
    const { user } = render(<PinningExample shouldAnimate={false} />);
    const web = screen.getByRole('button', { name: 'Web app: 6,100 traces' });
    const api = screen.getByRole('button', {
      name: 'Public API: 4,150 traces',
    });
    const webFlow = screen.getByRole('graphics-symbol', {
      name: 'Web app to GPT-5.6: 4,120 traces',
    });
    const sdkFlow = screen.getByRole('graphics-symbol', {
      name: 'SDK to Claude Opus 5: 940 traces',
    });

    await user.click(web);
    await user.unhover(web);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Web app');
    await user.hover(api);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Web app');
    expect(webFlow).toHaveAttribute('opacity', '1');
    expect(sdkFlow).toHaveAttribute('opacity', '0.08');
    await user.tab();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Web app');

    await user.click(api);
    expect(screen.getByRole('status')).toHaveTextContent('Pinned: Public API');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Public API');
    expect(webFlow).toHaveAttribute('opacity', '0.08');
    await user.click(api);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(webFlow).toHaveAttribute('opacity', '0.5');
    expect(sdkFlow).toHaveAttribute('opacity', '0.5');

    await user.hover(webFlow);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Web app → GPT-5.6');
  });

  it('clears pinning with Escape or the Unpin button', async () => {
    const { user } = render(<PinningExample shouldAnimate={false} />);
    const web = screen.getByRole('button', { name: 'Web app: 6,100 traces' });
    await user.click(web);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unpin' })).toBeDisabled();
    await user.click(web);
    await user.click(screen.getByRole('button', { name: 'Unpin' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Click a stage to pin'
    );
  });
});

describe('SankeyChart', () => {
  it('keeps animated flows attached and replays only when the rendered data changes', async () => {
    const props = {
      nodes,
      links,
      getLinkAriaLabel: (link: { id: string }) => link.id,
      showLegend: false,
    };
    const { rerender } = render(<SankeyChart {...props} />);
    const web = screen.getByRole('graphics-symbol', { name: 'Web' });
    const flow = screen.getByRole('graphics-symbol', { name: 'web->gpt' });

    await waitFor(() => {
      const width = Number(web.getAttribute('width'));
      expect(width).toBeGreaterThan(0);
      expect(width).toBeLessThan(16);
      const sourceX = Number(flow.getAttribute('d')?.split(' ')[1]);
      expect(sourceX).toBeCloseTo(Number(web.getAttribute('x')) + width);
    });
    await waitFor(() => expect(web).toHaveAttribute('width', '16'));

    rerender(
      <SankeyChart
        {...props}
        nodes={[...nodes]}
        links={[...links]}
        activeNodeId="web"
      />
    );
    expect(web).toHaveAttribute('width', '16');
    expect(flow).toHaveAttribute('opacity', '1');

    rerender(<SankeyChart {...props} links={[links[0]]} />);
    await waitFor(() =>
      expect(Number(web.getAttribute('width'))).toBeLessThan(16)
    );
    await waitFor(() => expect(web).toHaveAttribute('width', '16'));
  });

  it('renders an accessible chart with nodes, links, and a derived legend', () => {
    render(
      <>
        <h2 id="flow-title">Spend flows</h2>
        <SankeyChart
          aria-label="Spend by source and model"
          aria-labelledby="flow-title"
          nodes={nodes}
          links={links}
          getNodeAriaLabel={(node) => `node ${node.id}`}
          getLinkAriaLabel={(link) =>
            `flow ${link.sourceId} to ${link.targetId}`
          }
          shouldAnimate={false}
        />
      </>
    );

    expect(
      screen.getByRole('graphics-document', {
        name: 'Spend flows',
      })
    ).toBeVisible();
    expect(
      screen.getByRole('group', { name: 'Spend by source and model legend' })
    ).toBeVisible();
    expect(
      screen.getByRole('graphics-symbol', { name: 'flow web to gpt' })
    ).toBeVisible();
    expect(screen.getByLabelText('node web')).toBeVisible();
  });

  it('exposes actionable nodes and links as keyboard-operable buttons', async () => {
    const onNodeActivate = vi.fn();
    const onLinkActivate = vi.fn();
    const { user } = render(
      <SankeyChart
        aria-label="Activation"
        nodes={nodes}
        links={links}
        getNodeAriaLabel={(node) => `node ${node.id}`}
        onNodeActivate={onNodeActivate}
        onLinkActivate={onLinkActivate}
        showLegend={false}
        shouldAnimate={false}
      />
    );

    const link = screen.getByRole('button', { name: 'Web to GPT-5.6: 120' });
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onLinkActivate).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole('button', { name: 'node web' }));
    expect(onNodeActivate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'web' })
    );
    await user.click(link);
    expect(onLinkActivate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'web->gpt' })
    );
    // Assistive technology can dispatch a click without preceding pointer events.
    fireEvent.click(link, { detail: 0 });
    fireEvent.click(screen.getByRole('button', { name: 'node web' }), {
      detail: 0,
    });
    expect(onLinkActivate).toHaveBeenCalledTimes(4);
    expect(onNodeActivate).toHaveBeenCalledTimes(2);
  });

  it('leaves Space available for scrolling on passive marks', () => {
    render(
      <SankeyChart
        nodes={nodes}
        links={links}
        getLinkAriaLabel={(link) => link.id}
        shouldAnimate={false}
      />
    );
    // user.keyboard cannot report whether the browser's default action was canceled.
    for (const name of ['Web', 'web->gpt']) {
      expect(
        fireEvent.keyDown(screen.getByRole('graphics-symbol', { name }), {
          key: ' ',
        })
      ).toBe(true);
    }
  });

  it.each(['activation', 'focus'])(
    'names links from JSX endpoints for %s',
    async (interaction) => {
      const props = {
        nodes: [
          {
            id: 'env-93',
            label: <span>Production</span>,
            ariaLabel: 'Production',
          },
          {
            id: 'model-1',
            label: <span>Primary model</span>,
            ariaLabel: 'Primary model',
          },
        ],
        links: [{ sourceId: 'env-93', targetId: 'model-1', value: 5 }],
        onLinkActivate: interaction === 'activation' ? vi.fn() : undefined,
        onLinkFocus: interaction === 'focus' ? vi.fn() : undefined,
        showLegend: false,
        shouldAnimate: false,
      };
      const { user, rerender } = render(<SankeyChart {...props} />);
      const role = interaction === 'activation' ? 'button' : 'graphics-symbol';
      const link = screen.getByRole(role, {
        name: 'Production to Primary model: 5',
      });
      await user.tab();
      expect(link).toHaveFocus();
      rerender(
        <SankeyChart {...props} getLinkAriaLabel={() => 'Custom flow name'} />
      );
      expect(link).toHaveAccessibleName('Custom flow name');
    }
  );

  it.each([undefined, 'Production: 5 requests'])(
    'renders JSX labels independently of the accessible name %s',
    (ariaLabel) => {
      render(
        <SankeyChart
          nodes={[{ id: 'prod', label: <span>Production</span>, ariaLabel }]}
          links={[]}
          showLegend={false}
          shouldAnimate={false}
        />
      );

      expect(screen.getByText('Production')).toBeVisible();
      expect(
        screen.getByRole('graphics-symbol', { name: ariaLabel ?? 'prod' })
      ).toBeVisible();
    }
  );

  it.each([
    { label: null, ariaLabel: 'Production', expected: 'Production' },
    { label: undefined, expected: 'prod' },
    { label: false, ariaLabel: 'Production', expected: 'Production' },
    { label: true, expected: 'prod' },
    { label: 0, ariaLabel: 'No requests', expected: '0' },
  ])(
    'renders $expected for node label $label',
    ({ label, ariaLabel, expected }) => {
      render(
        <SankeyChart
          nodes={[{ id: 'prod', label, ariaLabel }]}
          links={[]}
          showLegend={false}
          shouldAnimate={false}
        />
      );

      expect(screen.getByText(expected)).toBeVisible();
    }
  );

  it('retains supplied names on legend controls for decorative JSX labels', () => {
    render(
      <SankeyChart
        nodes={[
          {
            id: 'env-93',
            label: <span aria-hidden="true">●</span>,
            ariaLabel: 'Production',
          },
        ]}
        links={[]}
        showLegend
        legendProps={{ onItemClick: () => {} }}
        shouldAnimate={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Production' })).toBeVisible();
  });

  it.each([
    {
      label: 'Web',
      ariaLabel: 'Web traffic: 120',
      override: 'Custom name',
      expected: 'Custom name',
    },
    {
      label: 'Web',
      ariaLabel: 'Web traffic: 120',
      override: undefined,
      expected: 'Web traffic: 120',
    },
    { label: 'Web', expected: 'Web' },
    { label: 120, expected: '120' },
    { label: <span>Web</span>, expected: 'web' },
  ])(
    'uses $expected as the node keyboard target name',
    async ({ label, ariaLabel, override, expected }) => {
      const { user } = render(
        <SankeyChart
          aria-label="Node naming"
          nodes={[{ id: 'web', label, ariaLabel }]}
          links={[]}
          getNodeAriaLabel={override == null ? undefined : () => override}
          showLegend={false}
          shouldAnimate={false}
        />
      );

      const chart = screen.getByRole('graphics-document', {
        name: 'Node naming',
      });
      const node = within(chart).getByRole('graphics-symbol', {
        name: expected,
      });
      expect(node).toBeVisible();
      await user.tab();
      expect(node).toHaveFocus();
    }
  );

  it('dims links away from the active node via built-in legend hover', async () => {
    const { user } = render(
      <SankeyChart
        aria-label="Emphasis"
        getLinkAriaLabel={(link) => link.id}
        nodes={nodes}
        links={links}
        shouldAnimate={false}
        legendProps={{ layout: 'list' }}
      />
    );

    const legend = screen.getByRole('group', { name: 'Emphasis legend' });
    const webItem = within(legend).getByRole('group', { name: /^Web/ });
    const webLink = screen.getByRole('graphics-symbol', { name: 'web->gpt' });
    const sdkLink = screen.getByRole('graphics-symbol', { name: 'sdk->gpt' });
    expect(webLink).toHaveAttribute('opacity', '0.5');
    expect(sdkLink).toHaveAttribute('opacity', '0.5');

    await user.hover(webItem);
    expect(webLink).toHaveAttribute('opacity', '1');
    expect(sdkLink).toHaveAttribute('opacity', '0.08');

    await user.unhover(webItem);
    expect(sdkLink).toHaveAttribute('opacity', '0.5');
  });

  it('emphasizes one link and its endpoint nodes from activeLinkId', () => {
    render(
      <SankeyChart
        aria-label="Link emphasis"
        getLinkAriaLabel={(link) => link.id}
        nodes={nodes}
        links={links}
        activeLinkId="web->gpt"
        shouldAnimate={false}
      />
    );

    expect(
      screen.getByRole('graphics-symbol', { name: 'web->gpt' })
    ).toHaveAttribute('opacity', '1');
    expect(
      screen.getByRole('graphics-symbol', { name: 'sdk->gpt' })
    ).toHaveAttribute('opacity', '0.08');
  });

  it('hides filtered nodes with their touching links but keeps legend rows', () => {
    render(
      <SankeyChart
        aria-label="Filtering"
        getLinkAriaLabel={(link) => `flow ${link.id}`}
        nodes={nodes}
        links={links}
        selectedIds={new Set(['web', 'gpt'])}
        getNodeAriaLabel={(node) => `node ${node.id}`}
        shouldAnimate={false}
        legendProps={{
          layout: 'list',
          onItemClick: vi.fn(),
        }}
      />
    );

    expect(screen.getByLabelText('node web')).toBeVisible();
    expect(screen.getByLabelText('node gpt')).toBeVisible();
    expect(screen.queryByLabelText('node sdk')).not.toBeInTheDocument();
    const chart = screen.getByRole('graphics-document', { name: 'Filtering' });
    expect(
      within(chart).getAllByRole('graphics-symbol', { name: /^flow / })
    ).toHaveLength(1);
    // Legend still lists every node so the filter can be undone by its owner.
    const legend = screen.getByRole('group', { name: 'Filtering legend' });
    expect(within(legend).getByRole('button', { name: /^Web/ })).toBeVisible();
    expect(within(legend).getByRole('button', { name: /^SDK/ })).toBeVisible();
  });

  it('recovers to the full graph when a selection outlives its nodes', () => {
    render(
      <SankeyChart
        aria-label="Stale selection"
        nodes={nodes}
        links={links}
        selectedIds={new Set(['departed-node'])}
        getNodeAriaLabel={(node) => `node ${node.id}`}
        shouldAnimate={false}
      />
    );

    expect(screen.getByLabelText('node web')).toBeVisible();
    expect(screen.getByLabelText('node gpt')).toBeVisible();
  });

  it('renders an empty svg without data', () => {
    render(
      <SankeyChart
        aria-label="Empty"
        nodes={[]}
        links={[]}
        shouldAnimate={false}
      />
    );

    expect(screen.getByRole('img', { name: 'Empty' })).toBeVisible();
    expect(screen.queryAllByRole('graphics-symbol')).toHaveLength(0);
  });

  it('drops dangling links but keeps their endpoints as isolated nodes', () => {
    render(
      <SankeyChart
        aria-label="Dangling links"
        getLinkAriaLabel={(link) => `flow ${link.id}`}
        nodes={nodes}
        links={[...links, { sourceId: 'web', targetId: 'ghost', value: 5 }]}
        getNodeAriaLabel={(node) => `node ${node.id}`}
        shouldAnimate={false}
      />
    );

    expect(screen.getByLabelText('node web')).toBeVisible();
    const chart = screen.getByRole('graphics-document', {
      name: 'Dangling links',
    });
    expect(
      within(chart).getAllByRole('graphics-symbol', { name: /^flow / })
    ).toHaveLength(2);
  });

  it('hides marks while rendering but keeps the chart mounted', () => {
    render(
      <SankeyChart
        aria-label="Resizing"
        nodes={nodes}
        links={links}
        isRendering={false}
        getNodeAriaLabel={(node) => `node ${node.id}`}
        shouldAnimate={false}
      />
    );

    const chart = screen.getByRole('graphics-document', { name: 'Resizing' });
    expect(within(chart).queryAllByRole('graphics-symbol')).toHaveLength(0);
  });
});
