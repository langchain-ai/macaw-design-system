import { useState } from 'react';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/Command/Command';
import type { CommandMenuItem } from '../components/Command/CommandMenu';
import { CommandMenu } from '../components/Command/CommandMenu';
import { Text } from '../components/Text/Text';

const meta = {
  title: 'Components/Popovers/CommandMenu',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Searchable command palette built on cmdk. **You probably want to use `Select` instead** — it composes Command + Popover into a ready-made searchable dropdown. Use Command directly only when you need a fully custom command palette, global search, or slash-command menu.',
      },
    },
  },
  args: {
    items: [],
    onSelect: (_value: string) => {},
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-[320px] rounded-md border border-secondary">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const fruits: CommandMenuItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];

export const Default: Story = {
  args: {
    items: fruits,
    onSelect: (_value) => {},
    placeholder: 'Search fruits...',
  },
};

/**
 * Action menus — where clicking an item performs an action and closes the menu
 * (e.g. "add this run to a queue") rather than selecting a persistent value —
 * pass `showSelectedIndicator={false}`. There's no current selection to mark,
 * so the leading check column is dropped and labels sit flush-left. Identical
 * to `Default` above apart from the reserved indicator slot.
 */
export const WithoutSelectedIndicator: Story = {
  args: {
    items: fruits,
    onSelect: (_value) => {},
    placeholder: 'Search fruits...',
    showSelectedIndicator: false,
  },
};

export const WithGroups: Story = {
  args: {
    groups: [
      {
        heading: 'Fruits',
        items: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'cherry', label: 'Cherry' },
        ],
      },
      {
        heading: 'Vegetables',
        items: [
          { value: 'carrot', label: 'Carrot' },
          { value: 'broccoli', label: 'Broccoli' },
          { value: 'spinach', label: 'Spinach' },
        ],
      },
    ],
    onSelect: (_value) => {},
  },
};

export const WithDisabledItems: Story = {
  args: {
    items: [
      { value: 'available', label: 'Available option' },
      { value: 'disabled', label: 'Disabled option', disabled: true },
      { value: 'also_available', label: 'Another available option' },
    ],
    onSelect: (_value) => {},
  },
};

export const HiddenSearch: Story = {
  args: {
    items: fruits,
    onSelect: (_value) => {},
    hideSearch: true,
  },
};

export const WithDescriptions: Story = {
  args: {
    items: [
      {
        value: 'run_count',
        label: 'Run count',
        description: 'Total number of runs in the selected time range',
      },
      {
        value: 'error_rate',
        label: 'Error rate',
        description: 'Percentage of runs that ended in an error',
      },
      {
        value: 'latency_p50',
        label: 'Latency (p50)',
        description: 'Median latency across all runs',
      },
    ],
    onSelect: (_value) => {},
    placeholder: 'Search metrics...',
  },
};

export const WithRightDecorators: Story = {
  args: {
    items: [
      {
        value: 'copy',
        label: 'Copy',
        rightDecorator: (
          <Text as="span" variant="xs" className="text-tertiary">
            Ctrl+C
          </Text>
        ),
      },
      {
        value: 'paste',
        label: 'Paste',
        rightDecorator: (
          <Text as="span" variant="xs" className="text-tertiary">
            Ctrl+V
          </Text>
        ),
      },
      {
        value: 'cut',
        label: 'Cut',
        rightDecorator: (
          <Text as="span" variant="xs" className="text-tertiary">
            Ctrl+X
          </Text>
        ),
      },
    ],
    onSelect: (_value) => {},
    placeholder: 'Search actions...',
  },
};

export const CustomEmptyText: Story = {
  args: {
    items: [],
    onSelect: () => {},
    emptyText: 'Nothing here yet. Create one first.',
  },
};

export const CustomRender: Story = {
  render: () => {
    const statusItems: CommandMenuItem[] = [
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'archived', label: 'Archived' },
    ];

    const statusColors: Record<string, string> = {
      active: 'bg-success-primary',
      paused: 'bg-warning-primary',
      archived: 'bg-error-primary',
    };

    return (
      <CommandMenu
        items={statusItems}
        onSelect={() => {}}
        placeholder="Search statuses..."
        renderItem={(item) => (
          <div className="flex items-center gap-space-2">
            <span
              className={`size-2 rounded-full ${statusColors[item.value] ?? ''}`}
            />
            <Text as="span">{item.label}</Text>
          </div>
        )}
      />
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | undefined>();
    return (
      <div className="flex flex-col gap-space-2">
        <Text variant="xs" className="px-space-2 py-1.5 text-secondary">
          Selected: {selected ?? 'none'}
        </Text>
        <CommandMenu
          items={fruits}
          value={selected}
          onSelect={setSelected}
          placeholder="Search fruits..."
        />
      </div>
    );
  },
};

export const InfiniteLoading: Story = {
  render: () => {
    const pageSize = 10;
    const [items, setItems] = useState<CommandMenuItem[]>(() =>
      Array.from({ length: pageSize }, (_, i) => ({
        value: `item_${i + 1}`,
        label: `Item ${i + 1}`,
      }))
    );
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const totalPages = 5;

    const loadMore = () => {
      if (loading || page >= totalPages) return;
      setLoading(true);
      setTimeout(() => {
        const nextPage = page + 1;
        setItems((prev) => [
          ...prev,
          ...Array.from({ length: pageSize }, (_, i) => {
            const idx = (nextPage - 1) * pageSize + i + 1;
            return { value: `item_${idx}`, label: `Item ${idx}` };
          }),
        ]);
        setPage(nextPage);
        setLoading(false);
      }, 800);
    };

    return (
      <CommandMenu
        items={items}
        onSelect={() => {}}
        placeholder="Search items..."
        disableFilter
        loading={loading}
        onEndReached={loadMore}
      />
    );
  },
};

/**
 * For advanced use cases (custom layouts, global search, slash commands),
 * you can use the low-level primitives directly.
 */
export const Primitives: Story = {
  render: () => (
    <Command className="p-1.5">
      <CommandInput placeholder="Search..." />
      <CommandList>
        {fruits.map((fruit) => (
          <CommandItem key={fruit.value} value={fruit.value}>
            <Text as="span">{fruit.label}</Text>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  ),
};
