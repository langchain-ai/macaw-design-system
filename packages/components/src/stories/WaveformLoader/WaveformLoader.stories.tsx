import type { Meta, StoryObj } from '@storybook/react-vite';

import { WaveformLoader } from './WaveformLoader';

import styles from './WaveformLoader.module.css';

const meta = {
  title: 'Components/Status/*WaveformLoader',
  component: WaveformLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Experimental, Storybook-only PoC based on the supplied waveform artwork. Not exported for consumers. Continuous lines morph independently through changing frequencies and amplitudes, allowing lobes to appear and disappear. Speed sets the pulse interval: Slow (500ms), Medium (250ms), Fast (100ms). Reduced-motion preferences disable pulsing.',
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
      <div className={styles.preview}>
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
    <div className={styles.speeds}>
      {(['slow', 'medium', 'fast'] as const).map((speed) => (
        <div key={speed}>
          <p className={styles.caption}>
            {speed === 'slow'
              ? 'Slow · 500ms'
              : speed === 'medium'
                ? 'Medium · 250ms'
                : 'Fast · 100ms'}
          </p>
          <WaveformLoader speed={speed} />
        </div>
      ))}
    </div>
  ),
};

export const Responsive: Story = {
  render: (args) => (
    <div className={styles.responsive}>
      <p className={styles.caption}>
        Resize the viewport: each waveform scales with its container.
      </p>
      <WaveformLoader {...args} />
      <WaveformLoader {...args} className={styles.compact} />
      <WaveformLoader {...args} className={styles.inline} />
    </div>
  ),
};
