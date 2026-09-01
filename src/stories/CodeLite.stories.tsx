import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeLite } from '../components/Code/CodeLite';

const SAMPLE_CODE = `{
  "name": "example-agent",
  "tools": [
    "search",
    "calculator"
  ],
  "settings": {
    "streaming": true,
    "maxIterations": 10
  }
}`;

const meta = {
  title: 'Components/Display/CodeLite',
  component: CodeLite,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Use `CodeLite` by default for read-only syntax-highlighted code. It avoids mounting a full CodeMirror editor, making it more performant when rendering multiple code blocks, while retaining syntax highlighting, folding, and optional virtualization. Use `Code` only when editing or custom CodeMirror extensions are required.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    language: 'json',
    value: SAMPLE_CODE,
    showGutter: true,
    wrapLines: true,
  },
} satisfies Meta<typeof CodeLite>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutGutter: Story = {
  args: {
    showGutter: false,
  },
};
