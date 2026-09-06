import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Code } from '.';

const SAMPLE_CODE = `type Greeting = {
  message: string;
};

export function greet(name: string): Greeting {
  return { message: \`Hello, \${name}!\` };
}`;

const meta = {
  title: 'Components/Display/Code',
  component: Code,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`Code` should be used when we want to allow for editable text. If we want to display read-only code snippets, use `CodeLite` instead since its more lightweight',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    language: 'typescript',
    readOnly: false,
    value: SAMPLE_CODE,
  },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Editable code with the same controlled value contract used in product. */
export const Editable: Story = {
  args: {
    autoFocus: true,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return <Code {...args} value={value} onChange={setValue} />;
  },
};

/** Read-only syntax highlighting with copy support. */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    showCopyButton: true,
  },
};

/** Compact highlighting without line numbers or selection matching. */
export const Plain: Story = {
  args: {
    readOnly: true,
    variant: 'plain',
  },
};
