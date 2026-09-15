import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { TopList, type TopListItem } from '.';
import {
  CHART_OTHER_COLOR,
  getCategoricalFillChartColor,
} from '../../utils/chartColors';
import { Text } from '../Text';

const items: readonly TopListItem[] = [
  {
    id: 'claude-sonnet',
    label: 'Claude 3.7 Sonnet',
    value: 2_320,
    color: getCategoricalFillChartColor(0),
  },
  {
    id: 'gpt-5',
    label: 'GPT-5',
    value: 1_910,
    color: getCategoricalFillChartColor(1),
  },
  {
    id: 'gemini-pro',
    label: 'Gemini 2.5 Pro Experimental',
    value: 1_520,
    color: getCategoricalFillChartColor(2),
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    value: 1_120,
    color: getCategoricalFillChartColor(3),
  },
  {
    id: 'other',
    label: 'Other',
    value: 820,
    color: CHART_OTHER_COLOR,
  },
];

const signedItems: readonly TopListItem[] = [
  { id: 'quality', label: 'Quality score', value: 84 },
  { id: 'latency', label: 'Latency change', value: -42 },
  { id: 'cost', label: 'Cost change', value: -18 },
];

const InteractiveTopList = () => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activatedLabel, setActivatedLabel] = useState<string | null>(null);

  return (
    <div className="mx-auto flex h-72 w-full max-w-2xl flex-col gap-space-2">
      <div className="min-h-0 flex-1">
        <TopList
          aria-label="Interactive top models by runs"
          items={items}
          activeItemId={activeItemId}
          valueAxisLabel="Runs"
          onItemPointerMove={(item) => setActiveItemId(item.id)}
          onItemPointerOut={() => setActiveItemId(null)}
          onItemFocus={(item) => setActiveItemId(item.id)}
          onItemBlur={() => setActiveItemId(null)}
          onItemActivate={(item) => setActivatedLabel(item.label)}
        />
      </div>
      <Text variant="xs" color="secondary">
        {activatedLabel == null
          ? 'Hover, focus, or activate a row.'
          : `Activated ${activatedLabel}`}
      </Text>
    </div>
  );
};

const meta = {
  title: 'Components/Charts/TopList',
  component: TopList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive ranked list for top-K categorical data. TopList composes BarChart with horizontal rows, sorting, limits, truncated category labels, formatted value labels, and accessible item interactions. Consumers retain data fetching, domain-specific Other aggregation, tooltips, navigation, and loading or empty states.',
      },
    },
  },
  argTypes: {
    shouldAnimate: {
      control: 'boolean',
      description:
        'Animates chart marks unless disabled or reduced motion is preferred.',
      table: { defaultValue: { summary: 'true' } },
    },
    sort: {
      control: 'select',
      options: ['descending', 'ascending', 'none'],
      description:
        'Sort direction or a custom comparator. Sorting happens before the limit is applied.',
      table: { defaultValue: { summary: 'descending' } },
    },
    limit: {
      control: { type: 'number', min: 0 },
      description: 'Maximum number of sorted rows to render.',
    },
  },
  tags: ['autodocs', 'ranked', 'list', 'horizontal', 'bar', 'chart'],
  args: {
    'aria-label': 'Top models by runs',
    items,
    limit: 5,
    valueAxisLabel: 'Runs',
    categoryLabelWidth: 180,
  },
  render: (args) => (
    <div className="mx-auto h-72 w-full max-w-2xl">
      <TopList {...args} />
    </div>
  ),
} satisfies Meta<typeof TopList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Descending: Story = {};

export const Ascending: Story = {
  args: { sort: 'ascending' },
};

export const SemanticOtherLast: Story = {
  name: 'Custom sort keeps Other last',
  args: {
    items: items.map((item) =>
      item.id === 'other' ? { ...item, value: 4_200 } : item
    ),
    sort: (left, right) => {
      if (left.id === 'other') return 1;
      if (right.id === 'other') return -1;
      return right.value - left.value;
    },
  },
};

export const SignedValues: Story = {
  args: {
    items: signedItems,
    valueAxisLabel: 'Change',
    formatValue: (value) =>
      new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero' }).format(
        value
      ),
  },
};

export const Narrow: Story = {
  render: (args) => (
    <div className="mx-auto h-72 w-64">
      <TopList {...args} categoryLabelWidth={80} />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => <InteractiveTopList />,
};
