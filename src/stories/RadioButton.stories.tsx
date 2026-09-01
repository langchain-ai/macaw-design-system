import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioButton } from '../components/RadioButton/RadioButton';
import { RadioGroup } from '../components/RadioGroup/RadioGroup';

const meta: Meta<typeof RadioButton> = {
  title: 'Components/Inputs/RadioButton',
  component: RadioButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
  decorators: [
    (Story) => (
      <RadioGroup defaultValue="option1">
        <Story />
      </RadioGroup>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

// Size variants
export const Sizes: Story = {
  args: {
    value: 'sizes',
    label: 'Size demo',
  },
  render: function SizesShowcase() {
    const [value1, setValue1] = useState('small');
    const [value2, setValue2] = useState('medium');

    return (
      <div className="flex flex-col gap-space-3">
        <div className="flex items-center gap-space-4">
          <span className="w-20 text-sm text-tertiary">Small:</span>
          <RadioGroup value={value1} onValueChange={setValue1}>
            <RadioButton value="small" label="Small radio" size="sm" />
          </RadioGroup>
        </div>
        <div className="flex items-center gap-space-4">
          <span className="w-20 text-sm text-tertiary">Medium:</span>
          <RadioGroup value={value2} onValueChange={setValue2}>
            <RadioButton
              value="medium"
              label="Medium radio (default)"
              size="md"
            />
          </RadioGroup>
        </div>
      </div>
    );
  },
};

// Basic states
export const Unchecked: Story = {
  args: {
    value: 'unchecked',
    label: 'Unchecked',
  },
  decorators: [
    (Story) => (
      <RadioGroup defaultValue="other">
        <Story />
      </RadioGroup>
    ),
  ],
};

export const Checked: Story = {
  args: {
    value: 'checked',
    label: 'Checked',
  },
  decorators: [
    (Story) => (
      <RadioGroup defaultValue="checked">
        <Story />
      </RadioGroup>
    ),
  ],
};

// Disabled states
export const DisabledUnchecked: Story = {
  args: {
    value: 'disabled',
    disabled: true,
    label: 'Disabled Unchecked',
  },
  decorators: [
    (Story) => (
      <RadioGroup defaultValue="other">
        <Story />
      </RadioGroup>
    ),
  ],
};

export const DisabledChecked: Story = {
  args: {
    value: 'disabled-checked',
    disabled: true,
    label: 'Disabled Checked',
  },
  decorators: [
    (Story) => (
      <RadioGroup defaultValue="disabled-checked">
        <Story />
      </RadioGroup>
    ),
  ],
};

// Interactive example with group
export const InteractiveGroup: Story = {
  args: {
    value: 'option1',
    label: 'Option 1',
  },
  render: function InteractiveRadioGroup() {
    const [value, setValue] = useState('option1');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <RadioButton value="option1" label="Option 1" />
        <RadioButton value="option2" label="Option 2" />
        <RadioButton value="option3" label="Option 3" />
      </RadioGroup>
    );
  },
};

// All variants showcase
export const AllVariants: Story = {
  args: {
    value: 'showcase',
    label: 'All variants demo',
  },
  render: function AllVariantsShowcase() {
    const [value, setValue] = useState('option1');

    return (
      <div className="space-y-space-6">
        {/* Size variants */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Sizes</h3>
          <div className="flex flex-col gap-space-3">
            <div className="flex items-center gap-space-4">
              <span className="w-20 text-sm text-tertiary">Small:</span>
              <RadioGroup defaultValue="small">
                <RadioButton value="small" label="Small radio" size="sm" />
              </RadioGroup>
            </div>
            <div className="flex items-center gap-space-4">
              <span className="w-20 text-sm text-tertiary">Medium:</span>
              <RadioGroup defaultValue="medium">
                <RadioButton
                  value="medium"
                  label="Medium radio (default)"
                  size="md"
                />
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Basic group */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Radio Group</h3>
          <RadioGroup value={value} onValueChange={setValue}>
            <RadioButton value="option1" label="First option" />
            <RadioButton value="option2" label="Second option" />
            <RadioButton value="option3" label="Third option" />
          </RadioGroup>
        </div>

        {/* Disabled states */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Disabled States</h3>
          <RadioGroup defaultValue="disabled-checked">
            <RadioButton
              value="disabled-unchecked"
              disabled
              label="Disabled Unchecked"
            />
            <RadioButton
              value="disabled-checked"
              disabled
              label="Disabled Checked"
            />
          </RadioGroup>
        </div>

        {/* Practical example */}
        <div className="space-y-space-4">
          <h3 className="text-lg font-semibold">Practical Example</h3>
          <PlanSelectionExample />
        </div>
      </div>
    );
  },
};

// Accessibility variants - using aria-label instead of visible label
export const WithAriaLabel: Story = {
  args: {
    value: 'aria-label-demo',
    'aria-label': 'Select option',
  },
  render: function AriaLabelShowcase() {
    const [value, setValue] = useState('option1');
    return (
      <div className="space-y-space-4">
        <p className="text-sm text-tertiary">
          These radio buttons have no visible label but use aria-label for
          screen readers:
        </p>
        <RadioGroup
          value={value}
          onValueChange={setValue}
          className="flex-row items-center gap-space-5"
        >
          <div className="flex items-center gap-space-2">
            <RadioButton value="option1" aria-label="First option" />
            <span className="text-sm">
              (aria-label: &quot;First option&quot;)
            </span>
          </div>
          <div className="flex items-center gap-space-2">
            <RadioButton value="option2" aria-label="Second option" />
            <span className="text-sm">
              (aria-label: &quot;Second option&quot;)
            </span>
          </div>
        </RadioGroup>
      </div>
    );
  },
};

export const WithAriaLabelledBy: Story = {
  args: {
    value: 'aria-labelledby-demo',
    'aria-labelledby': 'custom-label',
  },
  render: function AriaLabelledByShowcase() {
    const [value, setValue] = useState('monthly');
    return (
      <div className="space-y-space-4">
        <p className="text-sm text-tertiary">
          These radio buttons are labeled by external elements using
          aria-labelledby:
        </p>
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center gap-space-3 rounded-md border border-secondary p-space-3">
            <RadioButton value="monthly" aria-labelledby="monthly-label" />
            <div>
              <p id="monthly-label" className="font-medium">
                Monthly billing
              </p>
              <p className="text-sm text-tertiary">$10/month, billed monthly</p>
            </div>
          </div>
          <div className="flex items-center gap-space-3 rounded-md border border-secondary p-space-3">
            <RadioButton value="annual" aria-labelledby="annual-label" />
            <div>
              <p id="annual-label" className="font-medium">
                Annual billing
              </p>
              <p className="text-sm text-tertiary">
                $96/year, save 20% ($8/month)
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>
    );
  },
};

// Plan selection example
function PlanSelectionExample() {
  const [plan, setPlan] = useState('pro');

  return (
    <div className="rounded-md border border-secondary p-space-4">
      <p className="mb-space-3 font-medium">Select a plan:</p>
      <RadioGroup value={plan} onValueChange={setPlan}>
        <RadioButton value="free" label="Free - $0/month" />
        <RadioButton value="pro" label="Pro - $10/month" />
        <RadioButton value="enterprise" label="Enterprise - Contact us" />
      </RadioGroup>
      <p className="mt-space-3 text-sm text-tertiary">
        Selected: <span className="font-medium text-primary">{plan}</span>
      </p>
    </div>
  );
}
