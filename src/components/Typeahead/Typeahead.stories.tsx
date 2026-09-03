import { useMemo, useState } from 'react';

import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { LightningIcon } from '@phosphor-icons/react/dist/ssr/Lightning';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { Text } from '../Text';
import { Typeahead } from '../Typeahead';
import type { TypeaheadOption, TypeaheadSize } from '../Typeahead';

const metricOptions: TypeaheadOption[] = [
  { value: 'run_count', label: 'Run count' },
  { value: 'error_rate', label: 'Error rate' },
  { value: 'latency_p50', label: 'Latency (p50)' },
  { value: 'latency_p99', label: 'Latency (p99)' },
  { value: 'token_count', label: 'Token count' },
  { value: 'cost', label: 'Cost' },
];

/**
 * Stateful harness backing the args-driven stories below; Storybook needs a
 * component whose props match the args controls.
 */
function SingleTypeaheadStory(props: {
  options: TypeaheadOption[];
  placeholder: string;
  emptyText: string;
  disabled: boolean;
  freeSolo: boolean;
  disableClearable: boolean;
  size: TypeaheadSize;
}) {
  const [value, setValue] = useState<
    string | TypeaheadOption | null | undefined
  >(null);

  return (
    <Typeahead<TypeaheadOption>
      value={value}
      onChange={setValue}
      options={props.options}
      placeholder={props.placeholder}
      emptyText={props.emptyText}
      disabled={props.disabled}
      freeSolo={props.freeSolo}
      disableClearable={props.disableClearable}
      size={props.size}
    />
  );
}

const meta = {
  title: 'Components/Inputs/Typeahead',
  component: SingleTypeaheadStory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Canonical searchable selection input built on the design-system Popover and cmdk primitives. Use the `multiple` mode for searchable multi-selects with removable chips, and add `freeSolo` only when values outside the provided options are valid.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    options: metricOptions,
    placeholder: 'Search metrics...',
    emptyText: 'No metrics found.',
    disabled: false,
    freeSolo: false,
    disableClearable: false,
    size: 'md',
  },
  argTypes: {
    placeholder: { control: 'text' },
    emptyText: { control: 'text' },
    disabled: { control: 'boolean' },
    freeSolo: { control: 'boolean' },
    disableClearable: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-space-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SingleTypeaheadStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => {
    const [xsValue, setXsValue] = useState<
      string | TypeaheadOption | null | undefined
    >(null);
    const [smValue, setSmValue] = useState<
      string | TypeaheadOption | null | undefined
    >(null);
    const [mdValue, setMdValue] = useState<
      string | TypeaheadOption | null | undefined
    >(null);
    const [lgValue, setLgValue] = useState<
      string | TypeaheadOption | null | undefined
    >(null);
    const [inputValue, setInputValue] = useState('');

    return (
      <div className="grid w-[30rem] grid-cols-[3rem_7rem_minmax(0,1fr)] items-center gap-space-2">
        <Text variant="xs" color="secondary">
          xs
        </Text>
        <Button size="xs" variant="outlined" color="secondary">
          Action
        </Button>
        <Typeahead<TypeaheadOption>
          size="xs"
          value={xsValue}
          onChange={setXsValue}
          options={metricOptions}
          placeholder="Extra small..."
        />

        <Text variant="xs" color="secondary">
          sm
        </Text>
        <Button size="sm" variant="outlined" color="secondary">
          Action
        </Button>
        <Typeahead<TypeaheadOption>
          size="sm"
          value={smValue}
          onChange={setSmValue}
          options={metricOptions}
          placeholder="Small..."
        />

        <Text variant="xs" color="secondary">
          md
        </Text>
        <Button size="md" variant="outlined" color="secondary">
          Action
        </Button>
        <Typeahead<TypeaheadOption>
          size="md"
          value={mdValue}
          onChange={setMdValue}
          options={metricOptions}
          placeholder="Medium..."
        />

        <Text variant="xs" color="secondary">
          lg
        </Text>
        <Input
          value={inputValue}
          onChange={setInputValue}
          placeholder="Input"
        />
        <Typeahead<TypeaheadOption>
          size="lg"
          value={lgValue}
          onChange={setLgValue}
          options={metricOptions}
          placeholder="Large..."
        />
      </div>
    );
  },
};

/**
 * `Typeahead multiple` is the canonical searchable multi-select. Keep
 * `freeSolo` off when values must come from the provided options.
 */
export const SearchableMultiSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['production']);

    return (
      <Typeahead<string>
        multiple
        disableCloseOnSelect
        value={value}
        onChange={setValue}
        options={['production', 'staging', 'canary', 'development']}
        placeholder="Search environments..."
        emptyText="No environments found."
      />
    );
  },
};

export const MultipleFreeSolo: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['base']);
    const [query, setQuery] = useState('');

    const options = useMemo(
      () =>
        ['base', 'production', 'staging', 'canary', 'evals'].filter((option) =>
          option.toLowerCase().includes(query.toLowerCase())
        ),
      [query]
    );

    return (
      <Typeahead<string>
        multiple
        freeSolo
        disableCloseOnSelect
        value={value}
        onChange={setValue}
        inputValue={query}
        onInputChange={setQuery}
        options={options}
        placeholder="Find or add split..."
      />
    );
  },
};

export const WrappedMultiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([
      'base',
      'staging',
      'evals',
      'production',
      'canary',
    ]);
    const [query, setQuery] = useState('');

    const options = useMemo(
      () =>
        ['base', 'production', 'staging', 'canary', 'evals'].filter((option) =>
          option.toLowerCase().includes(query.toLowerCase())
        ),
      [query]
    );

    return (
      <Typeahead<string>
        multiple
        freeSolo
        disableCloseOnSelect
        value={value}
        onChange={setValue}
        inputValue={query}
        onInputChange={setQuery}
        options={options}
        placeholder="Find or add split..."
      />
    );
  },
};

export const MultipleWithCustomCreate: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['apple']);
    const [query, setQuery] = useState('');
    const trimmedQuery = query.trim();
    const options = ['apple', 'banana', 'cherry', 'date', 'elderberry'].filter(
      (option) => !value.includes(option)
    );

    return (
      <Typeahead<string>
        multiple
        disableCloseOnSelect
        value={value}
        onChange={setValue}
        inputValue={query}
        onInputChange={setQuery}
        options={options}
        maxVisibleOptions={3}
        placeholder="Find or add tags..."
        onCreateNew={
          trimmedQuery
            ? (inputValue) => {
                if (!inputValue || value.includes(inputValue)) return;
                setValue([...value, inputValue]);
                setQuery('');
              }
            : undefined
        }
        createNewLabel={(inputValue) =>
          inputValue && (
            <>
              Add new
              <Badge color="plain" rounded="sm" size="sm">
                {inputValue}
              </Badge>
            </>
          )
        }
        emptyState={
          <Text as="span" variant="sm" color="tertiary">
            No matching tags.
          </Text>
        }
        listFooter={
          <Text as="div" variant="xs" color="tertiary" className="px-space-2">
            Showing up to 3 suggestions.
          </Text>
        }
      />
    );
  },
};

const environmentOptions: TypeaheadOption[] = [
  {
    value: 'production',
    label: 'Production',
    description: 'Traffic-facing environment',
    rightDecorator: (
      <span className="inline-flex text-icon-success">
        <CheckCircleIcon size={16} weight="bold" />
      </span>
    ),
  },
  {
    value: 'staging',
    label: 'Staging',
    description: 'Release validation',
    rightDecorator: (
      <span className="inline-flex text-icon-warning">
        <LightningIcon size={16} weight="bold" />
      </span>
    ),
  },
  {
    value: 'archived',
    label: 'Archived',
    description: 'Hidden from new runs',
    disabled: true,
    rightDecorator: (
      <span className="inline-flex text-icon-disabled">
        <WarningCircleIcon size={16} weight="bold" />
      </span>
    ),
  },
];

export const CustomRendering: Story = {
  render: () => {
    const [value, setValue] = useState<TypeaheadOption[]>([
      environmentOptions[0],
    ]);

    return (
      <Typeahead<TypeaheadOption>
        multiple
        value={value}
        onChange={(nextValue) =>
          setValue(
            nextValue.filter(
              (option): option is TypeaheadOption => typeof option !== 'string'
            )
          )
        }
        options={environmentOptions}
        placeholder="Choose environments..."
        renderTags={(values, getTagProps) =>
          values.map((option, index) => {
            const tagProps = getTagProps({ index });
            const label =
              typeof option === 'string'
                ? option
                : (option.label ?? option.value);
            return (
              <Badge
                key={tagProps.key}
                color="plain"
                rounded="sm"
                size="sm"
                onClick={tagProps.onDelete}
                data-tag-index={tagProps['data-tag-index']}
                className="cursor-pointer"
              >
                {label}
              </Badge>
            );
          })
        }
        renderOption={(option, state) => (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-space-3">
            <div className="flex min-w-0 flex-col gap-space-1">
              <Text as="span" variant="sm" className="truncate text-primary">
                {option.label}
              </Text>
              <Text as="span" variant="xs" className="truncate text-tertiary">
                {option.description}
              </Text>
            </div>
            {state.selected ? (
              <Badge color="primary" size="xs" rounded="sm">
                Selected
              </Badge>
            ) : (
              option.rightDecorator
            )}
          </div>
        )}
      />
    );
  },
};
