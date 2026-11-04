import { useId } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlainTextEditor } from '.';
import { Text } from '../Text';

const meta = {
  title: 'Components/Inputs/PlainTextEditor',
  component: PlainTextEditor,
  tags: ['autodocs', 'text', 'editor', 'multiline', 'links'],
  args: { value: 'Edit this text or paste a link.', readOnly: false },
  render: function Example(args) {
    const id = useId();
    return (
      <div className="flex w-full max-w-lg flex-col gap-space-2">
        <Text
          as={args.readOnly ? 'span' : 'label'}
          variant="sm"
          htmlFor={args.readOnly ? undefined : id}
        >
          Notes
        </Text>
        <PlainTextEditor {...args} id={id} />
      </div>
    );
  },
} satisfies Meta<typeof PlainTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {};
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: 'Read the guide at https://docs.langchain.com.',
  },
};
