import { useState } from 'react';

import { LightningIcon } from '@phosphor-icons/react/dist/ssr/Lightning';
import { RocketLaunchIcon } from '@phosphor-icons/react/dist/ssr/RocketLaunch';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../components/Icon/Icon';
import { Select } from '../components/Select';
import type { SelectGroup, SelectOption } from '../components/Select';
import { Text } from '../components/Text/Text';
import { CheckIcon } from '../icons/PaddedPhosphorIcons';

const metricOptions: SelectOption[] = [
  { value: 'run_count', label: 'Run count' },
  { value: 'error_rate', label: 'Error rate' },
  { value: 'latency_p50', label: 'Latency (p50)' },
  { value: 'latency_p99', label: 'Latency (p99)' },
  { value: 'token_count', label: 'Token count' },
  { value: 'cost', label: 'Cost' },
];

/**
 * Stateful wrapper so Storybook args controls work while
 * selection state is managed internally.
 */
function SelectStory(props: {
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled: boolean;
  size: 'xs' | 'sm' | 'md' | 'lg';
  allowDeselect: boolean;
  hideSearch: boolean;
}) {
  const [value, setValue] = useState<string | undefined>();
  return (
    <Select
      value={value}
      onChange={setValue}
      options={props.options}
      placeholder={props.placeholder}
      searchPlaceholder={props.searchPlaceholder}
      emptyText={props.emptyText}
      disabled={props.disabled}
      size={props.size}
      allowDeselect={props.allowDeselect}
      hideSearch={props.hideSearch}
    />
  );
}

const meta = {
  title: 'Components/Inputs/Select',
  component: SelectStory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    options: metricOptions,
    placeholder: 'Select metric...',
    searchPlaceholder: 'Search metrics...',
    emptyText: 'No results found.',
    disabled: false,
    size: 'sm',
    allowDeselect: false,
    hideSearch: true,
  },
  argTypes: {
    placeholder: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    emptyText: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    allowDeselect: { control: 'boolean' },
    hideSearch: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-[280px] p-space-6">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof SelectStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[17.5rem] flex-col gap-space-2">
      <Select
        value={undefined}
        onChange={() => undefined}
        options={metricOptions}
        placeholder="Extra small"
        size="xs"
      />
      <Select
        value={undefined}
        onChange={() => undefined}
        options={metricOptions}
        placeholder="Small"
        size="sm"
      />
      <Select
        value={undefined}
        onChange={() => undefined}
        options={metricOptions}
        placeholder="Medium"
        size="md"
      />
      <Select
        value={undefined}
        onChange={() => undefined}
        options={metricOptions}
        placeholder="Large"
        size="lg"
      />
    </div>
  ),
};

const constrainedOptions: SelectOption[] = [
  {
    value: 'api-standards',
    label: 'api-standards',
    description:
      'API design standards: URL/versioning, response shape, RFC 7807 errors, pagination, status codes, auth.',
  },
  {
    value: 'langster-supply-chain',
    label: 'langster-supply-chain',
    description:
      'Dependency and build-system policy for package supply-chain review.',
  },
  {
    value: 'df3f3028a-f7e9-4cf1-af95-9b9cee7bb617',
    label: 'df3f3028a-f7e9-4cf1-af95-9b9cee7bb617',
  },
];

export const ConstrainedWidthOpen: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('api-standards');

    return (
      <Select
        value={value}
        onChange={setValue}
        options={constrainedOptions}
        placeholder="Select Context Hub repo"
        searchPlaceholder="Search Context Hub repos..."
        hideSearch={false}
        open
        onOpenChange={() => undefined}
      />
    );
  },
};

const longValueOptions: SelectOption[] = [
  {
    value: 'long',
    label: 'alexandra.hollingsworth+staging@example-organization.com',
  },
  { value: 'short', label: 'Short label' },
];

export const LongSelectedValueTruncates: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('long');

    return (
      <Select
        value={value}
        onChange={setValue}
        options={longValueOptions}
        placeholder="Select value"
        searchPlaceholder="Search values..."
        hideSearch={false}
        triggerClassName="w-[12.5rem]"
      />
    );
  },
};

export const WithDescriptions: Story = {
  args: {
    options: [
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
      {
        value: 'token_count',
        label: 'Token count',
        description: 'Total tokens consumed by all runs',
      },
    ],
    placeholder: 'Select metric...',
  },
};

export const WithRightDecorators: Story = {
  args: {
    options: [
      {
        value: 'production',
        label: 'Production',
        rightDecorator: (
          <span className="inline-flex text-success-secondary">
            <RocketLaunchIcon size={16} weight="bold" />
          </span>
        ),
      },
      {
        value: 'staging',
        label: 'Staging',
        rightDecorator: (
          <span className="inline-flex text-warning-secondary">
            <LightningIcon size={16} weight="bold" />
          </span>
        ),
      },
      {
        value: 'development',
        label: 'Development',
        rightDecorator: (
          <span className="inline-flex text-tertiary">
            <WarningCircleIcon size={16} weight="bold" />
          </span>
        ),
      },
    ],
    placeholder: 'Select environment...',
  },
};

export const WithDeselect: Story = {
  args: {
    allowDeselect: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Searchable: Story = {
  args: {
    hideSearch: false,
  },
};

const disabledOptions: SelectOption[] = [
  { value: 'run_count', label: 'Run count' },
  { value: 'error_rate', label: 'Error rate' },
  { value: 'latency_p50', label: 'Latency (p50)', disabled: true },
  { value: 'latency_p99', label: 'Latency (p99)', disabled: true },
  { value: 'token_count', label: 'Token count' },
];

export const WithDisabledOptions: Story = {
  args: {
    options: disabledOptions,
  },
};

export const CustomEmptyText: Story = {
  args: {
    options: [],
    emptyText: 'Nothing here yet. Create one first.',
  },
};

const manyOptions: SelectOption[] = Array.from({ length: 50 }, (_, i) => ({
  value: `option_${i + 1}`,
  label: `Option ${i + 1}`,
}));

export const ManyOptions: Story = {
  args: {
    options: manyOptions,
    placeholder: 'Select from 50 options...',
    searchPlaceholder: 'Search options...',
    hideSearch: false,
  },
};

const colorOptions: SelectOption[] = [
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
];

const colorMap: Record<string, string> = {
  red: 'bg-error-primary',
  orange: 'bg-warning-primary',
  yellow: 'bg-warning-secondary',
  green: 'bg-success-primary',
  blue: 'bg-brand-primary',
  purple: 'bg-purple',
};

/** Custom rendering for both the trigger value and each option. */
export const CustomRender: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Select
        value={value}
        onChange={setValue}
        options={colorOptions}
        placeholder="Pick a color..."
        renderValue={(option) => (
          <span className="flex items-center gap-space-2">
            <span
              className={`size-3 rounded-full ${colorMap[option.value] ?? ''}`}
            />
            {option.label}
          </span>
        )}
        renderOption={(option, isSelected) => (
          <>
            <Icon
              icon={CheckIcon}
              size="md"
              className={isSelected ? 'opacity-100' : 'opacity-0'}
            />
            <span
              className={`size-3 rounded-full ${colorMap[option.value] ?? ''}`}
            />
            <Text as="span">{option.label}</Text>
          </>
        )}
      />
    );
  },
};

/** Infinite loading — scroll to the bottom to load more items. */
export const InfiniteLoading: Story = {
  render: () => {
    const pageSize = 10;
    const [options, setOptions] = useState<SelectOption[]>(() =>
      Array.from({ length: pageSize }, (_, i) => ({
        value: `item_${i + 1}`,
        label: `Item ${i + 1}`,
      }))
    );
    const [value, setValue] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const totalPages = 5;

    const loadMore = () => {
      if (loading || page >= totalPages) return;
      setLoading(true);
      setTimeout(() => {
        const nextPage = page + 1;
        setOptions((prev) => [
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
      <Select
        value={value}
        onChange={setValue}
        options={options}
        placeholder="Select item..."
        disableFilter
        loading={loading}
        onEndReached={loadMore}
      />
    );
  },
};

const groupsWithHeadings: SelectGroup[] = [
  {
    heading: 'Fruits',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ],
  },
  {
    heading: 'Vegetables',
    options: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'broccoli', label: 'Broccoli' },
      { value: 'spinach', label: 'Spinach' },
    ],
  },
];

export const Grouped: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <Select
        value={value}
        onChange={setValue}
        groups={groupsWithHeadings}
        placeholder="Select an item..."
        searchPlaceholder="Search items..."
        hideSearch={false}
      />
    );
  },
};

const groupsWithoutHeadings: SelectGroup[] = [
  {
    options: [
      { value: 'human', label: 'Human' },
      { value: 'ai', label: 'AI' },
      { value: 'system', label: 'System' },
      { value: 'tool', label: 'Tool' },
    ],
  },
  { options: [{ value: 'chat', label: 'Chat' }] },
];

export const GroupedWithoutHeadings: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <Select
        value={value}
        onChange={setValue}
        groups={groupsWithoutHeadings}
        placeholder="Select an item..."
        searchPlaceholder="Search items..."
        hideSearch={false}
      />
    );
  },
};
