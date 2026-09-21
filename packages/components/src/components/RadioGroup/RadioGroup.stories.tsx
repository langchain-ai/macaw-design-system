import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../utils/cn';
import { RadioButton } from '../RadioButton/RadioButton';
import { Text } from '../Text';
import { RadioGroup } from './RadioGroup';
import { RadioGroupItem } from './RadioGroupItem';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Inputs/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'RadioButton follows the named selection-control scale. RadioGroupItem remains an intrinsic primitive whose consumer owns its outer pill geometry.',
      },
    },
  },
  tags: ['autodocs', 'single select', 'exclusive', 'choices'],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// ---------------------------------------------------------------------------
// Default — the canonical pairing: RadioGroup wrapping RadioButton options.
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option2">
      <RadioButton value="option1" label="Option 1" />
      <RadioButton value="option2" label="Option 2" />
      <RadioButton value="option3" label="Option 3" />
    </RadioGroup>
  ),
};

// ---------------------------------------------------------------------------
// Controlled selection
// ---------------------------------------------------------------------------

export const Controlled: Story = {
  render: function ControlledRadioGroup() {
    const [value, setValue] = useState('option1');
    return (
      <div className="flex flex-col gap-space-3">
        <RadioGroup value={value} onValueChange={setValue}>
          <RadioButton value="option1" label="Option 1" />
          <RadioButton value="option2" label="Option 2" />
          <RadioButton value="option3" label="Option 3" />
        </RadioGroup>
        <Text variant="sm" color="tertiary">
          Selected: {value}
        </Text>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Disabled group
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" disabled>
      <RadioButton value="option1" label="Option 1" />
      <RadioButton value="option2" label="Option 2" />
    </RadioGroup>
  ),
};

// ---------------------------------------------------------------------------
// Horizontal layout — override the default `flex flex-col` via className
// ---------------------------------------------------------------------------

export const HorizontalLayout: Story = {
  render: function HorizontalRadioGroup() {
    const [value, setValue] = useState('option1');
    return (
      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="flex-row gap-space-6"
      >
        <RadioButton value="option1" label="Option 1" />
        <RadioButton value="option2" label="Option 2" />
        <RadioButton value="option3" label="Option 3" />
      </RadioGroup>
    );
  },
};

// ---------------------------------------------------------------------------
// RadioGroupItem — the bare Radix indicator. It renders only the dot (it does
// not accept children), so it's typically sized down to a compact circle and
// placed inside a labeled, clickable row. This mirrors real usage such as the
// org selection cards in Settings.
// ---------------------------------------------------------------------------

function SelectableRow({
  value,
  label,
  description,
  selected,
}: {
  value: string;
  label: string;
  description: string;
  selected: boolean;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-space-3 rounded-lg border p-space-4',
        selected ? 'border-brand' : 'border-subtle'
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-space-1">
        <Text weight="medium">{label}</Text>
        <Text variant="sm" color="tertiary">
          {description}
        </Text>
      </div>
      <RadioGroupItem
        value={value}
        aria-label={label}
        className="size-5 shrink-0 items-center justify-center self-center p-0"
      />
    </label>
  );
}

export const WithRadioGroupItem: Story = {
  render: function RadioGroupItemRows() {
    const [value, setValue] = useState('starter');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <SelectableRow
          value="starter"
          label="Starter"
          description="For small teams getting started."
          selected={value === 'starter'}
        />
        <SelectableRow
          value="pro"
          label="Pro"
          description="For growing teams that need more."
          selected={value === 'pro'}
        />
        <SelectableRow
          value="enterprise"
          label="Enterprise"
          description="For organizations at scale."
          selected={value === 'enterprise'}
        />
      </RadioGroup>
    );
  },
};
