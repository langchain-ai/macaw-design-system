import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartLegend, type ChartLegendItem } from '.';
import { Text } from '../Text';

const legendItems: readonly ChartLegendItem[] = [
  {
    id: 'gpt-5.6-sol',
    label: 'gpt-5.6-sol',
    markerColor: 'var(--viz-brand-200)',
    value: '18.915s',
    secondaryValue: '33.5%',
  },
  {
    id: 'gpt-5.6-luna',
    label: 'gpt-5.6-luna',
    markerColor: 'var(--viz-purple-200)',
    value: '10.014s',
    secondaryValue: '17.7%',
  },
  {
    id: 'claude-opus-5',
    label: 'claude-opus-5',
    markerColor: 'var(--viz-magenta-200)',
    value: '8.958s',
    secondaryValue: '15.9%',
  },
  {
    id: 'claude-opus-4.8',
    label: 'claude-opus-4.8',
    markerColor: 'var(--viz-orange-200)',
    value: '7.586s',
    secondaryValue: '13.4%',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'gemini-3.1-flash-lite',
    markerColor: 'var(--viz-red-200)',
    value: '5.534s',
    secondaryValue: '9.8%',
  },
  {
    id: 'claude-haiku-4.5',
    label: 'claude-haiku-4.5',
    markerColor: 'var(--viz-sky-200)',
    value: '4.39s',
    secondaryValue: '7.8%',
  },
  {
    id: 'claude-sonnet-4.5',
    label: 'claude-sonnet-4.5',
    markerColor: 'var(--viz-green-200)',
  },
  {
    id: 'gpt-5.4-mini',
    label: 'gpt-5.4-mini',
    markerColor: 'var(--viz-acid-200)',
  },
  {
    id: 'kimi-k3',
    label: 'kimi-k3',
    markerColor: 'var(--viz-orange-400)',
  },
  {
    id: 'glm-5.2',
    label: 'glm-5.2',
    markerColor: 'var(--viz-purple-100)',
  },
];

/** Stands in for the chart the legend belongs to. */
const ChartPreview = () => (
  <div className="flex h-40 items-center justify-center rounded-md bg-surface-level-2">
    <Text variant="xs" color="quaternary">
      Chart preview
    </Text>
  </div>
);

const toggleId = (
  current: ReadonlySet<string>,
  id: string
): ReadonlySet<string> => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

const meta = {
  title: 'Components/Charts/ChartLegend',
  component: ChartLegend,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A chart legend with inline and list layouts. Items can act as selected chart filters. The default inline layout collapses overflow into a +N badge and popover, while the list layout displays every item with optional value columns.',
      },
    },
  },
  tags: ['autodocs', 'visualization', 'key', 'series', 'labels'],
} satisfies Meta<typeof ChartLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: legendItems.slice(0, 4),
  },
  render: ({ items: sourceItems, layout }) => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set(sourceItems[1] == null ? [] : [sourceItems[1].id])
    );

    return (
      <div className="flex w-[48rem] max-w-[90vw] flex-col gap-space-4">
        <ChartPreview />
        <ChartLegend
          items={sourceItems.map((item) => ({
            ...item,
            selected: selectedIds.has(item.id),
          }))}
          layout={layout}
          onItemClick={(item) =>
            setSelectedIds((current) => toggleId(current, item.id))
          }
        />
      </div>
    );
  },
};

export const Overflow: Story = {
  args: {
    items: legendItems,
  },
  render: ({ items: sourceItems, layout }) => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set(sourceItems[1] == null ? [] : [sourceItems[1].id])
    );

    return (
      <div className="flex flex-col gap-space-2">
        <Text variant="xs" color="secondary">
          Drag the card’s bottom-right edge to resize it, or click the legend
          background and +N badge.
        </Text>
        <div className="flex w-[32rem] min-w-64 max-w-[80vw] resize-x flex-col gap-space-4 overflow-auto">
          <ChartPreview />
          <ChartLegend
            items={sourceItems.map((item) => ({
              ...item,
              selected: selectedIds.has(item.id),
            }))}
            layout={layout}
            onItemClick={(item) =>
              setSelectedIds((current) => toggleId(current, item.id))
            }
          />
        </div>
      </div>
    );
  },
};

export const List: Story = {
  args: {
    items: legendItems.slice(0, 6),
    layout: 'list',
  },
  render: ({ items: sourceItems, layout }) => {
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
      () => new Set(sourceItems[1] == null ? [] : [sourceItems[1].id])
    );

    return (
      <div className="flex w-96 max-w-[90vw] flex-col gap-space-4">
        <ChartPreview />
        <ChartLegend
          items={sourceItems.map((item) => ({
            ...item,
            selected: selectedIds.has(item.id),
          }))}
          layout={layout}
          onItemClick={(item) =>
            setSelectedIds((current) => toggleId(current, item.id))
          }
        />
      </div>
    );
  },
};
