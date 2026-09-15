import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextWithLinks } from './TextWithLinks';

const meta = {
  title: 'Components/Display/TextWithLinks',
  component: TextWithLinks,
  tags: ['autodocs', 'text', 'automatic links', 'urls'],
  args: {
    text: 'Read the documentation at https://docs.langchain.com for more examples.',
  },
} satisfies Meta<typeof TextWithLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
