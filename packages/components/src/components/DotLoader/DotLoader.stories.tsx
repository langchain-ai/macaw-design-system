import type { Meta, StoryObj } from '@storybook/react-vite';

import { DotLoader } from './DotLoader';

const meta = {
  title: 'Components/Status/DotLoader',
  component: DotLoader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Four dotted waves settle into one calm line. Follows AppThemeProvider, with optional CSS color overrides. The approved motion uses a six-second loop and stops for reduced motion.',
      },
    },
  },
  tags: ['autodocs', 'loading', 'wave', 'dots', 'indeterminate'],
  argTypes: {
    color: { control: 'color' },
    mutedColor: { control: 'color' },
  },
} satisfies Meta<typeof DotLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = { globals: { backgrounds: { value: 'light' } } };
export const Dark: Story = { globals: { backgrounds: { value: 'dark' } } };
export const LightWithLabel: Story = {
  ...Light,
  args: { label: 'Loading traces' },
};
export const DarkWithLabel: Story = {
  ...Dark,
  args: { label: 'Loading traces' },
};
export const LightWide: Story = { ...Light, args: { width: 320, height: 64 } };
export const DarkWide: Story = { ...Dark, args: { width: 320, height: 64 } };
