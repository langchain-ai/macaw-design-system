import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text';
import { Slider } from './Slider';

const meta = {
  title: 'Components/Inputs/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Slider keeps one default density: a 16px thumb with component-owned track width and thickness. The thumb retains at least a 24px pointer target.',
      },
    },
  },
  tags: ['autodocs', 'range', 'control', 'numeric', 'input'],
  argTypes: {
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    disabled: { control: { type: 'boolean' } },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 3,
  },
  render: function DefaultSlider(args) {
    const [value, setValue] = useState(40);
    return (
      <div className="flex flex-col gap-space-4">
        <Text variant="body" className="text-secondary">
          Value: {value}
        </Text>
        <Slider
          {...args}
          value={value}
          onChange={(v) => setValue(v as number)}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 60,
    min: 0,
    max: 100,
    disabled: true,
  },
};

export const WithStep: Story = {
  args: {
    min: 0,
    max: 10,
    step: 2,
    defaultValue: 4,
  },
  render: function WithStepSlider(args) {
    const [value, setValue] = useState(4);
    return (
      <div className="flex flex-col gap-space-4">
        <Text variant="body" className="text-secondary">
          Value: {value}
        </Text>
        <Slider
          {...args}
          value={value}
          onChange={(v) => setValue(v as number)}
        />
      </div>
    );
  },
};

export const WithLabeledSteps: Story = {
  args: {
    min: 0,
    max: 3,
    step: 1,
  },
  render: function WithLabeledStepsSlider(args) {
    const stepNames = ['0', '25', '50', '100'];
    const [value, setValue] = useState(1);
    return (
      <div className="flex flex-col gap-space-4">
        <Text variant="body" className="text-secondary">
          Level: {stepNames[value]}
        </Text>
        <Slider
          {...args}
          value={value}
          onChange={(v) => setValue(v as number)}
          stepLabels={stepNames.map((label, i) => ({ value: i, label }))}
        />
      </div>
    );
  },
};

export const WithLongStepLabels: Story = {
  args: {
    min: 0,
    max: 3,
    step: 1,
  },
  render: function WithLongStepLabelsSlider(args) {
    const stepNames = [
      'Completely Off',
      'Low Priority',
      'Medium Priority',
      'High Priority',
    ];
    const [value, setValue] = useState(1);
    return (
      <div className="flex flex-col gap-space-4">
        <Text variant="body" className="text-secondary">
          Level: {stepNames[value]}
        </Text>
        <Slider
          {...args}
          value={value}
          onChange={(v) => setValue(v as number)}
          stepLabels={stepNames.map((label, i) => ({ value: i, label }))}
        />
      </div>
    );
  },
};

export const RangeSlider: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
  render: function RangeSliderExample(args) {
    const [value, setValue] = useState([20, 80]);
    return (
      <div className="flex flex-col gap-space-4">
        <Text variant="body" className="text-secondary">
          Range: {value[0]} – {value[1]}
        </Text>
        <Slider
          {...args}
          value={value}
          onChange={(v) => setValue(v as number[])}
        />
      </div>
    );
  },
};

export const AllVariants: Story = {
  args: {},
  render: function AllVariantsShowcase() {
    const [basic, setBasic] = useState(40);
    const [range, setRange] = useState([20, 70]);
    const [stepValue, setStepValue] = useState(50);
    return (
      <div className="flex w-72 flex-col gap-space-6">
        <div className="space-y-space-2">
          <Text variant="h3" className="font-medium">
            Single thumb
          </Text>
          <Text variant="xs" className="text-secondary">
            {basic}
          </Text>
          <Slider
            value={basic}
            onChange={(v) => setBasic(v as number)}
            min={0}
            max={100}
          />
        </div>

        <div className="space-y-space-2">
          <Text variant="h3" className="font-medium">
            Range (two thumbs)
          </Text>
          <Text variant="body" className="text-secondary">
            {range[0]} – {range[1]}
          </Text>
          <Slider
            value={range}
            onChange={(v) => setRange(v as number[])}
            min={0}
            max={100}
          />
        </div>

        <div className="space-y-space-2">
          <Text variant="h3" className="font-medium">
            With labeled steps
          </Text>
          <Slider
            value={stepValue}
            onChange={(v) => setStepValue(v as number)}
            min={0}
            max={100}
            step={25}
            stepLabels={[
              { value: 0, label: '0' },
              { value: 25, label: '25' },
              { value: 50, label: '50' },
              { value: 75, label: '75' },
              { value: 100, label: '100' },
            ]}
          />
        </div>

        <div className="space-y-space-2">
          <Text variant="h3" className="font-medium">
            Disabled
          </Text>
          <Slider value={60} disabled min={0} max={100} />
        </div>
      </div>
    );
  },
};
