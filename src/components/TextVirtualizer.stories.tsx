import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextVirtualizer } from './TextVirtualizer';

const meta = {
  title: 'Components/Display/TextVirtualizer',
  component: TextVirtualizer,
  tags: ['autodocs', 'large text', 'virtual scrolling'],
  args: {
    containerHeight: '300px',
    text: Array.from(
      { length: 1000 },
      (_, index) =>
        `Line ${index + 1}: Scroll to read more of this long document.`
    ).join('\n'),
    style: { whiteSpace: 'pre-wrap' },
  },
} satisfies Meta<typeof TextVirtualizer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
