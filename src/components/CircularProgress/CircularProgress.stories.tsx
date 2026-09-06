import type { Meta, StoryObj } from '@storybook/react-vite';

import { CircularProgress } from '.';

const meta = {
  title: 'Components/Status/CircularProgress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
    },
    size: {
      control: { type: 'number', min: 12, max: 240, step: 4 },
    },
    strokeWidth: {
      control: { type: 'number', min: 1, max: 24, step: 1 },
    },
    segments: { control: false },
  },
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single value from 0–1. Always provide an accessible label. */
export const Determinate: Story = {
  args: {
    value: 0.73,
    size: 100,
    strokeWidth: 10,
    'aria-label': '73% complete',
  },
};

/** Multiple semantic segments for a labelled status breakdown. */
export const Segmented: Story = {
  args: {
    segments: [
      { variant: 'success', percentage: 0.55 },
      { variant: 'error', percentage: 0.15 },
      { variant: 'warning', percentage: 0.2 },
    ],
    size: 100,
    strokeWidth: 10,
    'aria-label': 'Experiment results: 55% succeeded, 15% failed, 20% running',
  },
};

/** The compact treatment used beside sampling-rate labels. */
export const Compact: Story = {
  args: {
    value: 0.42,
    size: 16,
    strokeWidth: 2,
    'aria-label': '42% sampling rate',
  },
};
