import { describe, expect, it } from 'vitest';

import { getSankeyChartLayout, getSankeyLinkPath } from '../SankeyChart.utils';
import { getSankeyNodeLabels } from '../SankeyNodeLabel.utils';

const nodes = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
];

describe('getSankeyNodeLabels', () => {
  it.each([12, 50, 200])(
    'keeps visible labels apart in a %spx tall plot without dropping nodes',
    (innerHeight) => {
      const sources = Array.from({ length: 6 }, (_, index) => ({
        id: String(index),
        label: `Source ${index + 1}`,
      }));
      const layout = getSankeyChartLayout({
        nodes: [...sources, { id: 'target', label: 'Target' }],
        links: sources.map((node) => ({
          sourceId: node.id,
          targetId: 'target',
          value: 1,
        })),
        innerWidth: 400,
        innerHeight,
      });
      const labels = getSankeyNodeLabels(layout.nodes, 'justified');
      expect(labels).toHaveLength(7);
      const visible = labels.filter((label) => label.isVisible);
      expect(visible.length).toBeGreaterThanOrEqual(2);
      for (const label of visible) {
        for (const other of visible) {
          if (label === other || label.node.x !== other.node.x) continue;
          const center = (label.node.y0 + label.node.y1) / 2;
          const otherCenter = (other.node.y0 + other.node.y1) / 2;
          expect(Math.abs(center - otherCenter)).toBeGreaterThanOrEqual(16);
        }
      }
      if (innerHeight === 200) expect(visible).toHaveLength(7);
    }
  );

  it.each(['justified', 'center', 'left', 'right'] as const)(
    'keeps dense %s labels clear of neighboring columns and labels',
    (alignment) => {
      const denseNodes = Array.from({ length: 5 }, (_, index) => ({
        id: String(index),
        label: 'A long stage name',
        color: 'currentColor',
        depth: index,
        x: index * 88,
        y0: 0,
        y1: 100,
        value: 10,
      }));
      const labels = getSankeyNodeLabels(denseNodes, alignment);
      for (const label of labels) {
        expect(label.width).toBeGreaterThan(0);
        expect(label.width).toBeLessThanOrEqual(128);
        expect(label.x).toBeGreaterThanOrEqual(-134);
        for (const node of denseNodes) {
          expect(
            label.x + label.width <= node.x || label.x >= node.x + 16
          ).toBe(true);
        }
        for (const other of labels) {
          if (label === other) continue;
          expect(
            label.x + label.width <= other.x || label.x >= other.x + other.width
          ).toBe(true);
        }
      }
    }
  );

  it('uses occupied columns and clamps labels when there is no room', () => {
    const layoutNodes = [0, 300, 316].map((x, index) => ({
      id: String(index),
      label: 'Stage',
      color: 'currentColor',
      depth: index * 2,
      x,
      y0: 0,
      y1: 100,
      value: 10,
    }));
    expect(
      getSankeyNodeLabels(layoutNodes, 'justified').map((label) => label.width)
    ).toEqual([128, 0, 0]);
    const [outer] = getSankeyNodeLabels(layoutNodes.slice(0, 1), 'left');
    expect(outer).toMatchObject({ x: -134, width: 128, side: 'left' });
  });
});

describe('getSankeyChartLayout', () => {
  it.each([
    { maximum: 1e308, small: 1e-16, expected: 38 * Number.MIN_VALUE },
    { maximum: 1e308, small: 1e-15, expected: 376 * Number.MIN_VALUE },
    { maximum: 0.5, small: Number.MIN_VALUE, expected: 372 * Number.MIN_VALUE },
  ])(
    'retains pixel precision for $small beside $maximum',
    ({ maximum, small, expected }) => {
      const layout = getSankeyChartLayout({
        nodes: ['a', 'b', 'c', 'd'].map((id) => ({ id, label: id })),
        links: [
          { sourceId: 'a', targetId: 'b', value: maximum },
          { sourceId: 'c', targetId: 'd', value: small },
        ],
        innerWidth: 400,
        innerHeight: 200,
      });

      expect(layout.links[0]?.width).toBeCloseTo(186);
      expect(layout.links[1]?.width).toBe(expected);
    }
  );

  it('preserves subpixel ribbons when the input values are the smallest finite number', () => {
    const layout = getSankeyChartLayout({
      nodes: nodes.slice(0, 2),
      links: Array.from({ length: 400 }, () => ({
        sourceId: 'a',
        targetId: 'b',
        value: Number.MIN_VALUE,
      })),
      innerWidth: 400,
      innerHeight: 200,
    });

    expect(layout.links).toHaveLength(400);
    for (const link of layout.links) expect(link.width).toBe(0.5);
  });

  it('keeps mixed subnormal ribbons proportional and within their node edges', () => {
    const layout = getSankeyChartLayout({
      nodes: nodes.slice(0, 2),
      links: [
        ...Array.from({ length: 50 }, () => ({
          sourceId: 'a',
          targetId: 'b',
          value: Number.MIN_VALUE,
        })),
        { sourceId: 'a', targetId: 'b', value: 2 * Number.MIN_VALUE },
      ],
      innerWidth: 400,
      innerHeight: 200,
    });

    expect(layout.links.reduce((sum, link) => sum + link.width, 0)).toBeCloseTo(
      200
    );
    expect(layout.links[50]?.width).toBeCloseTo(200 / 26);
    for (const link of layout.links) {
      expect(link.y0 + link.width / 2).toBeLessThanOrEqual(
        link.source.y1 + 1e-6
      );
      expect(link.y1 + link.width / 2).toBeLessThanOrEqual(
        link.target.y1 + 1e-6
      );
    }
  });

  it.each([1e308, 1e-308])(
    'preserves flow proportions and finite geometry for values near %s',
    (magnitude) => {
      const graph = {
        nodes: ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, label: id })),
        links: [
          { sourceId: 'a', targetId: 'b', value: 1 },
          { sourceId: 'a', targetId: 'c', value: 1 },
          { sourceId: 'b', targetId: 'd', value: 1 },
          { sourceId: 'c', targetId: 'd', value: 1 },
          { sourceId: 'c', targetId: 'e', value: 0.5 },
        ],
        innerWidth: 400,
        innerHeight: 200,
      };
      const reference = getSankeyChartLayout(graph);
      const scaledLinks = graph.links.map((link) => ({
        ...link,
        value: link.value * magnitude,
      }));
      const layout = getSankeyChartLayout({ ...graph, links: scaledLinks });

      expect(layout.links.map((link) => link.value)).toEqual(
        scaledLinks.map((link) => link.value)
      );
      layout.links.forEach((link, index) => {
        expect(link.width).toBeGreaterThan(0);
        expect(link.width).toBeCloseTo(reference.links[index]?.width ?? 0);
        expect(Number.isFinite(link.y0)).toBe(true);
        expect(Number.isFinite(link.y1)).toBe(true);
      });
      for (const node of layout.nodes) {
        expect(
          [node.value, node.x, node.y0, node.y1].every(Number.isFinite)
        ).toBe(true);
        expect(node.y0).toBeGreaterThanOrEqual(0);
        expect(node.y1).toBeLessThanOrEqual(layout.innerHeight + 1e-6);
      }
      expect(layout.nodes.find((node) => node.id === 'a')?.value).toBe(
        Math.min(Number.MAX_VALUE, 2 * magnitude)
      );
      expect(layout.nodes.find((node) => node.id === 'd')?.value).toBe(
        Math.min(Number.MAX_VALUE, 2 * magnitude)
      );
    }
  );

  it.each([0, 160, 1200])(
    'keeps a twelve-stage flow moving forward at width %s',
    (innerWidth) => {
      const stages = Array.from({ length: 12 }, (_, index) => ({
        id: String(index),
        label: `Stage ${index + 1}`,
      }));
      const layout = getSankeyChartLayout({
        nodes: stages,
        links: stages.slice(1).map((stage, index) => ({
          sourceId: String(index),
          targetId: stage.id,
          value: 10,
        })),
        innerWidth,
        innerHeight: 200,
      });

      expect(layout.innerWidth).toBeGreaterThanOrEqual(innerWidth);
      for (const link of layout.links) {
        expect(link.target.x).toBeGreaterThan(link.source.x + 16);
        expect(link.target.x + 16).toBeLessThanOrEqual(layout.innerWidth);
      }
      if (innerWidth === 1200) expect(layout.innerWidth).toBe(innerWidth);
    }
  );

  it('assigns chain nodes to successive columns', () => {
    const layout = getSankeyChartLayout({
      nodes,
      links: [
        { sourceId: 'a', targetId: 'b', value: 10 },
        { sourceId: 'b', targetId: 'c', value: 10 },
      ],
      innerWidth: 400,
      innerHeight: 200,
    });

    expect(layout.nodes.map((node) => node.depth)).toEqual([0, 1, 2]);
    for (const node of layout.nodes) {
      expect(node.y1).toBeGreaterThan(node.y0);
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(400 - 16);
    }
  });

  it('conserves flow: intermediate nodes size to the larger side', () => {
    const layout = getSankeyChartLayout({
      nodes,
      links: [
        { sourceId: 'a', targetId: 'b', value: 10 },
        { sourceId: 'b', targetId: 'c', value: 6 },
      ],
      innerWidth: 400,
      innerHeight: 200,
    });

    const middle = layout.nodes.find((node) => node.id === 'b');
    expect(middle?.value).toBe(10);
  });

  it('drops links naming unknown nodes', () => {
    const layout = getSankeyChartLayout({
      nodes: nodes.slice(0, 2),
      links: [
        { sourceId: 'a', targetId: 'b', value: 10 },
        { sourceId: 'a', targetId: 'ghost', value: 5 },
        { sourceId: 'ghost', targetId: 'b', value: 5 },
      ],
      innerWidth: 400,
      innerHeight: 200,
    });

    expect(layout.links).toHaveLength(1);
    expect(layout.nodes).toHaveLength(2);
  });

  it.each([Number.NaN, 0, -3, Number.POSITIVE_INFINITY])(
    'drops links with non-finite or non-positive value %s',
    (value) => {
      const layout = getSankeyChartLayout({
        nodes,
        links: [
          { sourceId: 'a', targetId: 'b', value: 10 },
          { sourceId: 'a', targetId: 'c', value },
        ],
        innerWidth: 400,
        innerHeight: 200,
      });

      expect(layout.links).toHaveLength(1);
    }
  );

  it('rejects circular graphs instead of hanging', () => {
    expect(() =>
      getSankeyChartLayout({
        nodes,
        links: [
          { sourceId: 'a', targetId: 'b', value: 5 },
          { sourceId: 'b', targetId: 'a', value: 5 },
        ],
        innerWidth: 400,
        innerHeight: 200,
      })
    ).toThrow('circular link');
  });

  it('rejects a disconnected cycle beside a reconverging graph', () => {
    expect(() =>
      getSankeyChartLayout({
        nodes: ['a', 'b', 'c', 'd', 'x', 'y'].map((id) => ({ id, label: id })),
        links: [
          { sourceId: 'a', targetId: 'b', value: 1 },
          { sourceId: 'a', targetId: 'c', value: 1 },
          { sourceId: 'a', targetId: 'd', value: 1 },
          { sourceId: 'b', targetId: 'c', value: 1 },
          { sourceId: 'b', targetId: 'd', value: 1 },
          { sourceId: 'c', targetId: 'd', value: 1 },
          { sourceId: 'x', targetId: 'y', value: 1 },
          { sourceId: 'y', targetId: 'x', value: 1 },
        ],
        innerWidth: 400,
        innerHeight: 200,
      })
    ).toThrow('circular link');
  });

  it.each([50, 5])(
    'packs crowded columns into the reported height for a %spx plot',
    (innerHeight) => {
      const manyNodes = Array.from({ length: 6 }, (_, index) => ({
        id: `n${index}`,
        label: `Node ${index}`,
      }));
      const layout = getSankeyChartLayout({
        nodes: [...manyNodes, { id: 'target', label: 'Target' }],
        links: manyNodes.slice(1).map((node, index) => ({
          sourceId: node.id,
          targetId: 'target',
          value: index === 0 ? 100 : 0.01,
        })),
        alignment: 'left',
        innerWidth: 400,
        innerHeight,
      });

      expect(layout.innerHeight).toBe(Math.max(innerHeight, 12));
      const byColumn = new Map<number, typeof layout.nodes>();
      for (const node of layout.nodes) {
        expect(node.y0).toBeGreaterThanOrEqual(0);
        expect(node.y1).toBeLessThanOrEqual(layout.innerHeight + 1e-6);
        byColumn.set(node.depth, [...(byColumn.get(node.depth) ?? []), node]);
      }
      for (const column of byColumn.values()) {
        const ordered = [...column].sort((left, right) => left.y0 - right.y0);
        for (let index = 1; index < ordered.length; index += 1) {
          expect(ordered[index]!.y0).toBeGreaterThanOrEqual(
            ordered[index - 1]!.y1
          );
        }
      }
      for (const link of layout.links) {
        expect(link.width).toBeGreaterThanOrEqual(0);
      }
    }
  );

  it('keeps a crowded column inside fractional bounds alongside isolated nodes', () => {
    const layout = getSankeyChartLayout({
      nodes: [
        ...Array.from({ length: 8 }, (_, index) => ({
          id: String(index),
          label: String(index),
        })),
        { id: 'sink', label: 'Sink' },
      ],
      links: [{ sourceId: '0', targetId: 'sink', value: 1 }],
      alignment: 'left',
      innerWidth: 400,
      innerHeight: 30.0625,
    });

    for (const node of layout.nodes) {
      expect(node.y0).toBeGreaterThanOrEqual(0);
      expect(node.y1).toBeLessThanOrEqual(layout.innerHeight + 1e-6);
      expect(node.y1 - node.y0).toBeCloseTo(2);
    }
    expect(layout.links[0]?.width).toBeCloseTo(2);
  });

  it('keeps subpixel ribbons within their allocated node edges', () => {
    const layout = getSankeyChartLayout({
      nodes,
      links: [
        { sourceId: 'a', targetId: 'b', value: 100 },
        ...Array.from({ length: 100 }, (_, index) => ({
          id: `small-${index}`,
          sourceId: 'a',
          targetId: 'b',
          value: 0.01,
        })),
      ],
      innerWidth: 400,
      innerHeight: 200,
    });

    expect(layout.links[1]?.width).toBeLessThan(1);
    for (const node of layout.nodes) {
      for (const [endpoint, center] of [
        ['source', 'y0'],
        ['target', 'y1'],
      ] as const) {
        const ribbons = layout.links.filter(
          (link) => link[endpoint].id === node.id
        );
        let edge = node.y0;
        for (const link of ribbons) {
          expect(link[center] - link.width / 2).toBeCloseTo(edge);
          edge += link.width;
        }
        expect(edge).toBeLessThanOrEqual(node.y1 + 1e-6);
      }
    }
  });

  it('retains parallel link volume and preserves explicit IDs', () => {
    const layout = getSankeyChartLayout({
      nodes,
      links: [
        { sourceId: 'a', targetId: 'b', value: 10 },
        { sourceId: 'a', targetId: 'b', value: 20 },
        { id: 'a->b', sourceId: 'a', targetId: 'b', value: 30 },
        { id: 'independent', sourceId: 'a', targetId: 'b', value: 40 },
      ],
      innerWidth: 400,
      innerHeight: 200,
    });

    expect(layout.links.map((link) => link.value)).toEqual([10, 20, 30, 40]);
    expect(new Set(layout.links.map((link) => link.id)).size).toBe(4);
    expect(layout.links.find((link) => link.id === 'a->b')?.value).toBe(30);
    expect(layout.links.find((link) => link.id === 'independent')?.value).toBe(
      40
    );
    expect(layout.nodes.find((node) => node.id === 'a')?.value).toBe(100);
  });

  it('keeps every node inside the plot through relaxation', () => {
    // Diamond depths plus a busy middle column stress the relaxation passes;
    // collision pushes used to walk the tail past the bottom edge.
    const layout = getSankeyChartLayout({
      nodes: [
        { id: 'web', label: 'Web' },
        { id: 'api', label: 'API' },
        { id: 'sdk', label: 'SDK' },
        { id: 'gpt', label: 'GPT' },
        { id: 'claude', label: 'Claude' },
        { id: 'gemini', label: 'Gemini' },
        { id: 'other', label: 'Other' },
        { id: 'ok', label: 'OK' },
        { id: 'error', label: 'Error' },
      ],
      links: [
        { sourceId: 'web', targetId: 'gpt', value: 4_120 },
        { sourceId: 'web', targetId: 'claude', value: 1_980 },
        { sourceId: 'api', targetId: 'gpt', value: 2_640 },
        { sourceId: 'api', targetId: 'gemini', value: 1_510 },
        { sourceId: 'sdk', targetId: 'claude', value: 940 },
        { sourceId: 'sdk', targetId: 'other', value: 610 },
        { sourceId: 'gpt', targetId: 'ok', value: 6_120 },
        { sourceId: 'gpt', targetId: 'error', value: 640 },
        { sourceId: 'claude', targetId: 'ok', value: 2_570 },
        { sourceId: 'claude', targetId: 'error', value: 350 },
        { sourceId: 'gemini', targetId: 'ok', value: 1_390 },
        { sourceId: 'gemini', targetId: 'error', value: 120 },
        { sourceId: 'other', targetId: 'ok', value: 520 },
        { sourceId: 'other', targetId: 'error', value: 90 },
      ],
      innerWidth: 752,
      innerHeight: 338,
    });

    expect(
      Math.min(...layout.nodes.map((node) => node.y0))
    ).toBeGreaterThanOrEqual(0);
    expect(
      Math.max(...layout.nodes.map((node) => node.y1))
    ).toBeLessThanOrEqual(338.001);
  });

  it('layers diamonds by their deepest path', () => {
    const layout = getSankeyChartLayout({
      nodes: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
        { id: 'd', label: 'D' },
      ],
      links: [
        { sourceId: 'a', targetId: 'c', value: 100 },
        { sourceId: 'b', targetId: 'c', value: 100 },
        { sourceId: 'b', targetId: 'd', value: 100 },
        { sourceId: 'c', targetId: 'd', value: 100 },
      ],
      innerWidth: 400,
      innerHeight: 300,
    });

    expect(layout.nodes.find((node) => node.id === 'c')?.depth).toBe(1);
    expect(layout.nodes.find((node) => node.id === 'd')?.depth).toBe(2);
  });

  it('colors links after their source node by default', () => {
    const layout = getSankeyChartLayout({
      nodes: [
        { id: 'a', label: 'A', color: 'var(--chart-categorical-fill-2)' },
        { id: 'b', label: 'B' },
      ],
      links: [{ sourceId: 'a', targetId: 'b', value: 4 }],
      innerWidth: 400,
      innerHeight: 200,
    });

    expect(layout.links[0]?.color).toBe('var(--chart-categorical-fill-2)');
  });
});

describe('getSankeyLinkPath', () => {
  it('draws a closed ribbon spanning source to target', () => {
    const path = getSankeyLinkPath({
      sourceX: 16,
      targetX: 200,
      y0: 50,
      y1: 80,
      width: 10,
    });

    expect(path.startsWith('M 16 45')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
    expect(path).toContain('200 85');
  });
});
