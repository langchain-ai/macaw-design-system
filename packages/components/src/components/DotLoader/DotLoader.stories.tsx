import type { Meta, StoryObj } from '@storybook/react-vite';

import { DotLoader } from './DotLoader';

const meta = {
  title: 'Components/Status/DotLoader',
  component: DotLoader,
  parameters: {
    layout: 'centered',
    docs: {
      story: { inline: false, height: 160 },
      description: {
        component:
          'Four dotted waves settle into one calm line. Follows AppThemeProvider, with optional CSS color overrides. Speed presets: slow (6s), medium (4s, default), fast (2s). Stops for reduced motion.',
      },
    },
  },
  tags: ['autodocs', 'loading', 'wave', 'dots', 'indeterminate'],
  argTypes: {
    speed: { control: 'select', options: ['slow', 'medium', 'fast'] },
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
export const Slow: Story = { ...Dark, args: { speed: 'slow' } };
export const Medium: Story = { ...Dark, args: { speed: 'medium' } };
export const Fast: Story = { ...Dark, args: { speed: 'fast' } };
