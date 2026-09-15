import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from './Switch';

const meta = {
  title: 'Components/Inputs/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The size prop sets the 16/20px track height. Track width remains component-owned, and every tier keeps at least a 24px pointer target.',
      },
    },
  },
  tags: ['autodocs', 'toggle', 'boolean', 'setting'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
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
    labelPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
  },
  args: {
    onChange: () => {},
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

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

// Interactive example
export const Interactive: Story = {
  args: {
    checked: false,
    label: 'Toggle me',
  },
  render: function InteractiveSwitch(args) {
    const [checked, setChecked] = useState(args.checked ?? false);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
};

// Size variants
export const Sizes: Story = {
  args: {
    checked: true,
    label: 'Size demo',
  },
  render: function SizesShowcase() {
    const [sm, setSm] = useState(true);
    const [md, setMd] = useState(true);
    return (
      <div className="flex flex-col gap-space-5">
        <div className="space-y-space-2">
          <h4 className="text-sm font-medium">Small (sm, default)</h4>
          <div className="flex items-center gap-space-5">
            <Switch
              checked={false}
              onChange={() => {}}
              label="Unchecked"
              size="sm"
            />
            <Switch checked={sm} onChange={setSm} label="Checked" size="sm" />
          </div>
        </div>
        <div className="space-y-space-2">
          <h4 className="text-sm font-medium">Medium (md)</h4>
          <div className="flex items-center gap-space-5">
            <Switch
              checked={false}
              onChange={() => {}}
              label="Unchecked"
              size="md"
            />
            <Switch checked={md} onChange={setMd} label="Checked" size="md" />
          </div>
        </div>
      </div>
    );
  },
};

// Label position variants
export const LabelPositions: Story = {
  args: {
    checked: true,
    label: 'Label',
  },
  render: function LabelPositionShowcase() {
    const [left, setLeft] = useState(true);
    const [right, setRight] = useState(true);
    return (
      <div className="flex flex-col gap-space-4">
        <div className="space-y-space-1">
          <p className="text-sm text-tertiary">Label on right (default)</p>
          <Switch checked={right} onChange={setRight} label="Enable feature" />
        </div>
        <div className="space-y-space-1">
          <p className="text-sm text-tertiary">Label on left</p>
          <Switch
            checked={left}
            onChange={setLeft}
            label="Enable feature"
            labelPosition="left"
          />
        </div>
      </div>
    );
  },
};

// Disabled states
export const DisabledUnchecked: Story = {
  args: {
    checked: false,
    disabled: true,
    label: 'Disabled unchecked',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled checked',
  },
};

// All variants showcase
export const AllVariants: Story = {
  args: {
    checked: false,
    label: 'All variants demo',
  },
  render: function AllVariantsShowcase() {
    const [states, setStates] = useState({
      basic: false,
      sm: true,
      md: true,
      leftLabel: true,
      rightLabel: true,
    });
    const set = (key: keyof typeof states) => (v: boolean) =>
      setStates((s) => ({ ...s, [key]: v }));

    return (
      <div className="space-y-space-6">
        <div className="space-y-space-3">
          <h3 className="text-lg font-semibold">Basic States</h3>
          <div className="flex flex-col gap-space-3">
            <Switch checked={false} onChange={() => {}} label="Off" />
            <Switch checked={true} onChange={() => {}} label="On" />
            <Switch
              checked={states.basic}
              onChange={set('basic')}
              label="Interactive (click to toggle)"
            />
          </div>
        </div>

        <div className="space-y-space-3">
          <h3 className="text-lg font-semibold">Sizes</h3>
          <div className="flex flex-col gap-space-3">
            <Switch
              checked={states.sm}
              onChange={set('sm')}
              label="Small (sm, default)"
              size="sm"
            />
            <Switch
              checked={states.md}
              onChange={set('md')}
              label="Medium (md)"
              size="md"
            />
          </div>
        </div>

        <div className="space-y-space-3">
          <h3 className="text-lg font-semibold">Label Position</h3>
          <div className="flex flex-col gap-space-3">
            <Switch
              checked={states.leftLabel}
              onChange={set('leftLabel')}
              label="Label on left"
              labelPosition="left"
            />
            <Switch
              checked={states.rightLabel}
              onChange={set('rightLabel')}
              label="Label on right"
              labelPosition="right"
            />
          </div>
        </div>

        <div className="space-y-space-3">
          <h3 className="text-lg font-semibold">Disabled</h3>
          <div className="flex flex-col gap-space-3">
            <Switch
              checked={false}
              onChange={() => {}}
              label="Disabled off"
              disabled
            />
            <Switch
              checked={true}
              onChange={() => {}}
              label="Disabled on"
              disabled
            />
          </div>
        </div>
      </div>
    );
  },
};
