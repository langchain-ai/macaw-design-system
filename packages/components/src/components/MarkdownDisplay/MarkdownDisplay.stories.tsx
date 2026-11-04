import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text';
import { MarkdownDisplay } from './MarkdownDisplay';

const GFM_SAMPLE = `# Markdown display

Macaw renders **strong text**, _emphasis_, ~~strikethrough~~, [safe links](https://docs.langchain.com), and inline \`code\`.

> Blockquotes use semantic surfaces and borders.

## Lists and tasks

- Unordered item
- Nested content
  1. First step
  2. Second step
- [x] Completed task
- [ ] Open task

## Table

| Feature | Support |
| :--- | ---: |
| GFM tables | Yes |
| Task lists | Yes |

## Code

\`\`\`typescript
const greeting: string = 'Hello, Macaw';
console.log(greeting);
\`\`\`
`;

const meta = {
  title: 'Components/Display/MarkdownDisplay',
  component: MarkdownDisplay,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders untrusted CommonMark and GitHub Flavored Markdown with Macaw typography and controls. Import it directly from `@langchain/macaw-components/MarkdownDisplay`.',
      },
    },
  },
  tags: [
    'autodocs',
    'markdown',
    'gfm',
    'rich text',
    'formatted content',
    'code blocks',
    'task lists',
    'tables',
  ],
  args: {
    content: GFM_SAMPLE,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MarkdownDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondaryText: Story = {
  args: {
    content:
      'This copy uses a secondary text color while [links remain links](https://docs.langchain.com).',
    textColor: 'secondary',
  },
};

export const ComposedContent: Story = {
  args: {
    content: 'The component offers domain-free composition slots.',
    trailingContent: (
      <Text as="span" variant="sm" color="tertiary">
        {' '}
        Appended in the content flow.
      </Text>
    ),
    afterContent: (
      <div className="mt-space-3 rounded-md border border-subtle bg-surface-level-2 p-space-3 text-sm text-secondary">
        Content owned by the consuming feature.
      </div>
    ),
  },
};

export const PlainTextFallback: Story = {
  args: {
    content: `Large content falls back to plain text. https://docs.langchain.com\n\n${'Long content. '.repeat(1_600)}`,
    containerHeight: '16rem',
  },
};
