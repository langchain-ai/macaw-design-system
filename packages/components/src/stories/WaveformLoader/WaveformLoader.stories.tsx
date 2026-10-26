import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../../components/Text';
import { WaveformLoader } from './WaveformLoader';

const meta = {
  title: 'Components/Status/*WaveformLoader',
  component: WaveformLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Experimental, Storybook-only PoC based on the supplied waveform artwork. Not exported for consumers. The two lobes pulse independently to random amplitudes. Speed sets the pulse interval: Slow (500ms), Medium (250ms), Fast (100ms). Reduced-motion preferences disable pulsing.',
      },
    },
  },
  argTypes: {
    speed: {
      control: 'select',
      options: ['slow', 'medium', 'fast'],
    },
    className: { table: { disable: true } },
  },
  args: { speed: 'medium' },
  decorators: [
    (Story) => (
      <div className="w-full rounded-lg bg-surface-level-1">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WaveformLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Speeds: Story = {
  render: () => (
    <div className="grid gap-space-6 sm:grid-cols-3">
      {(['slow', 'medium', 'fast'] as const).map((speed) => (
        <div key={speed} className="min-w-0">
          <Text variant="sm" color="secondary">
            {speed === 'slow'
              ? 'Slow · 500ms'
              : speed === 'medium'
                ? 'Medium · 250ms'
                : 'Fast · 100ms'}
          </Text>
          <WaveformLoader speed={speed} />
        </div>
      ))}
    </div>
  ),
};

export const Responsive: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-space-6">
      <Text variant="sm" color="secondary">
        Resize the viewport: each waveform scales with its container.
      </Text>
      <WaveformLoader {...args} />
      <WaveformLoader {...args} className="max-w-sm" />
      <WaveformLoader {...args} className="max-w-40" />
    </div>
  ),
};
