import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from '../components/Checkbox/Checkbox';

const meta = {
  title: 'Components/Inputs/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'select' },
      options: [true, false, 'indeterminate'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
    },
  },
  args: {
    onCheckedChange: () => {},
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Size variants
export const Sizes: Story = {
  args: {
    checked: true,
    label: 'Size demo',
  },
  render: function SizesShowcase() {
    return (
      <div className="flex flex-col gap-space-5">
        {/* Small size - all states */}
        <div className="space-y-space-2">
          <h4 className="text-sm font-medium">Small (sm)</h4>
          <div className="flex items-center gap-space-5">
            <Checkbox
              checked={false}
              onCheckedChange={() => {}}
              label="Unchecked"
              size="sm"
            />
            <Checkbox
              checked={true}
              onCheckedChange={() => {}}
              label="Checked"
              size="sm"
            />
            <Checkbox
              checked="indeterminate"
              onCheckedChange={() => {}}
              label="Indeterminate"
              size="sm"
            />
          </div>
        </div>
        {/* Medium size - all states */}
        <div className="space-y-space-2">
          <h4 className="text-sm font-medium">Medium (md)</h4>
          <div className="flex items-center gap-space-5">
            <Checkbox
              checked={false}
              onCheckedChange={() => {}}
              label="Unchecked"
              size="md"
            />
            <Checkbox
              checked={true}
              onCheckedChange={() => {}}
              label="Checked"
              size="md"
            />
            <Checkbox
              checked="indeterminate"
              onCheckedChange={() => {}}
              label="Indeterminate"
              size="md"
            />
          </div>
        </div>
      </div>
    );
  },
};

// Basic states
export const Unchecked: Story = {
  args: {
    checked: false,
    label: 'Unchecked',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Checked',
  },
};

export const Indeterminate: Story = {
  args: {
    checked: 'indeterminate',
    label: 'Indeterminate',
  },
};

// Disabled states
export const DisabledUnchecked: Story = {
  args: {
    checked: false,
    disabled: true,
    label: 'Disabled Unchecked',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled Checked',
  },
};

export const DisabledIndeterminate: Story = {
  args: {
    checked: 'indeterminate',
    disabled: true,
    label: 'Disabled Indeterminate',
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    checked: false,
    label: 'Click me',
  },
  render: function InteractiveCheckbox(args) {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(
      args.checked ?? false
    );
    return (
      <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
    );
  },
};

// All variants showcase
export const AllVariants: Story = {
  args: {
    checked: false,
    label: 'All variants demo',
  },
  render: function AllVariantsShowcase() {
    const [checked1, setChecked1] = useState<boolean | 'indeterminate'>(false);
    const [checked2, setChecked2] = useState<boolean | 'indeterminate'>(true);
    const [checked3, setChecked3] = useState<boolean | 'indeterminate'>(
      'indeterminate'
    );

    return (
      <div className="space-y-space-6">
        {/* Size variants */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Sizes</h3>
          <div className="flex flex-col gap-space-3">
            <div className="flex items-center gap-space-4">
              <span className="w-20 text-sm text-tertiary">Small:</span>
              <Checkbox
                checked={false}
                onCheckedChange={() => {}}
                label="Unchecked"
                size="sm"
              />
              <Checkbox
                checked={true}
                onCheckedChange={() => {}}
                label="Checked"
                size="sm"
              />
              <Checkbox
                checked="indeterminate"
                onCheckedChange={() => {}}
                label="Indeterminate"
                size="sm"
              />
            </div>
            <div className="flex items-center gap-space-4">
              <span className="w-20 text-sm text-tertiary">Medium:</span>
              <Checkbox
                checked={false}
                onCheckedChange={() => {}}
                label="Unchecked"
                size="md"
              />
              <Checkbox
                checked={true}
                onCheckedChange={() => {}}
                label="Checked"
                size="md"
              />
              <Checkbox
                checked="indeterminate"
                onCheckedChange={() => {}}
                label="Indeterminate"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Basic states */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Basic States</h3>
          <div className="flex flex-col gap-space-3">
            <Checkbox
              checked={checked1}
              onCheckedChange={setChecked1}
              label="Unchecked (click to toggle)"
            />
            <Checkbox
              checked={checked2}
              onCheckedChange={setChecked2}
              label="Checked (click to toggle)"
            />
            <Checkbox
              checked={checked3}
              onCheckedChange={() =>
                setChecked3((prev) =>
                  prev === 'indeterminate'
                    ? false // Gmail behavior: indeterminate clears
                    : prev === false
                      ? true
                      : 'indeterminate'
                )
              }
              label="Indeterminate (click to cycle)"
            />
          </div>
        </div>

        {/* Disabled states */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Disabled States</h3>
          <div className="flex flex-col gap-space-3">
            <Checkbox
              checked={false}
              onCheckedChange={() => {}}
              disabled
              label="Disabled Unchecked"
            />
            <Checkbox
              checked={true}
              onCheckedChange={() => {}}
              disabled
              label="Disabled Checked"
            />
            <Checkbox
              checked="indeterminate"
              onCheckedChange={() => {}}
              disabled
              label="Disabled Indeterminate"
            />
          </div>
        </div>

        {/* Select all example */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Select All Demo</h3>
          <SelectAllExample />
        </div>
      </div>
    );
  },
};

// Accessibility variants - using aria-label instead of visible label
export const WithAriaLabel: Story = {
  args: {
    checked: true,
    'aria-label': 'Accept terms and conditions',
  },
  render: function AriaLabelShowcase() {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);
    return (
      <div className="space-y-space-4">
        <p className="text-sm text-tertiary">
          This checkbox has no visible label but uses aria-label for screen
          readers:
        </p>
        <div className="flex items-center gap-space-4">
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            aria-label="Accept terms and conditions"
          />
          <span className="text-sm">
            (aria-label: &quot;Accept terms and conditions&quot;)
          </span>
        </div>
      </div>
    );
  },
};

export const WithAriaLabelledBy: Story = {
  args: {
    checked: true,
    'aria-labelledby': 'custom-label',
  },
  render: function AriaLabelledByShowcase() {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(true);
    return (
      <div className="space-y-space-4">
        <p className="text-sm text-tertiary">
          This checkbox is labeled by an external element using aria-labelledby:
        </p>
        <div className="flex items-center gap-space-3 rounded-md border border-secondary p-space-3">
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            aria-labelledby="external-label"
          />
          <div>
            <p id="external-label" className="font-medium">
              Subscribe to newsletter
            </p>
            <p className="text-sm text-tertiary">
              Get weekly updates about new features
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// Select all example component
function SelectAllExample() {
  const [items, setItems] = useState([
    { id: 1, label: 'Item 1', checked: false },
    { id: 2, label: 'Item 2', checked: true },
    { id: 3, label: 'Item 3', checked: false },
    { id: 4, label: 'Item 4', checked: true },
  ]);

  const allChecked = items.every((item) => item.checked);
  const someChecked = items.some((item) => item.checked);
  const headerState: boolean | 'indeterminate' = allChecked
    ? true
    : someChecked
      ? 'indeterminate'
      : false;

  const toggleAll = () => {
    // Gmail behavior: clicking indeterminate or checked state clears all,
    // only clicking unchecked state selects all
    const newValue = !someChecked;
    setItems(items.map((item) => ({ ...item, checked: newValue })));
  };

  const toggleItem = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="rounded-md border border-secondary p-space-4">
      <div className="mb-space-2 border-b border-secondary pb-space-2">
        <Checkbox
          checked={headerState}
          onCheckedChange={toggleAll}
          label="Select All"
        />
      </div>
      <div className="flex flex-col gap-space-2">
        {items.map((item) => (
          <Checkbox
            key={item.id}
            checked={item.checked}
            onCheckedChange={() => toggleItem(item.id)}
            label={item.label}
          />
        ))}
      </div>
    </div>
  );
}
