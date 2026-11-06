import { useEffect, useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import { ChatMessage } from '../ChatMessage';
import { Text } from '../Text';
import { PREPARED_XML, XML_SOURCE } from './__tests__/xmlCompatibilitySample';
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
    'a11y-test',
    'markdown',
    'gfm',
    'rich text',
    'formatted content',
    'code blocks',
    'task lists',
    'tables',
    'streaming',
    'chat',
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

export const HeadingsAndInlineCode: Story = {
  parameters: { a11y: { test: 'error' } },
  args: {
    content: [1, 2, 3, 4, 5, 6]
      .map((level) => `${'#'.repeat(level)} Heading ${level} with \`code\``)
      .join('\n\n'),
  },
  play: async ({ canvasElement }) => {
    const headings = within(canvasElement).getAllByRole('heading');
    for (const heading of headings) {
      const code = heading.querySelector('code')!;
      const headingSize = parseFloat(getComputedStyle(heading).fontSize);
      await expect(parseFloat(getComputedStyle(code).fontSize)).toBeCloseTo(
        headingSize * 0.9,
        1
      );
    }
    const styles = headings.slice(3).map((heading) => {
      const style = getComputedStyle(heading);
      return [
        style.color,
        style.fontWeight,
        style.letterSpacing,
        style.textTransform,
      ].join(';');
    });
    await expect(new Set(styles).size).toBe(3);
  },
};

const LONG_CODE = `\`\`\`text
const response = await client.invoke({ message: "A long line of code that should stay inside a narrow chat pane without widening the surrounding message." });
\`\`\``;

export const CodeOverflow: Story = {
  parameters: { a11y: { test: 'error' } },
  args: { content: LONG_CODE },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const region = within(canvasElement).getByRole('region', {
      name: 'text',
    });
    if (args.codeOverflow === 'scroll') {
      await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    } else {
      await expect(region.scrollWidth).toBeLessThanOrEqual(
        region.clientWidth + 1
      );
    }
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.clientWidth + 1
    );
  },
};

export const ScrollingCode: Story = {
  ...CodeOverflow,
  args: { content: LONG_CODE, codeOverflow: 'scroll' },
};

export const WideTable: Story = {
  parameters: { a11y: { test: 'error' } },
  args: {
    content:
      '| First Column | Second Column | Third Column | Fourth Column |\n| --- | --- | --- | --- |\n| A deliberately wide value | Another wide value | Another wide value | Last wide value |',
  },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', { name: 'Table' });
    await userEvent.tab();
    await expect(region).toHaveFocus();
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    await expect(getComputedStyle(region).boxShadow).not.toBe('none');
  },
};

export const InChatMessage: Story = {
  render: (args) => (
    <div className="flex flex-col gap-space-6">
      <ChatMessage
        message={{
          id: 'question',
          role: 'user',
          status: 'completed',
          content: [
            {
              id: 'question-text',
              type: 'text',
              text: 'Show me the Markdown formatting options.',
            },
          ],
        }}
      />
      <ChatMessage
        isLatest
        message={{
          id: 'answer',
          role: 'assistant',
          status: 'completed',
          content: [
            {
              id: 'answer-markdown',
              type: 'custom',
              content: <MarkdownDisplay {...args} />,
            },
          ],
        }}
      />
    </div>
  ),
};

const STREAMING_CHUNKS = [
  '## Streaming response\n\nMarkdown stays **readable',
  '## Streaming response\n\nMarkdown stays **readable** while it arrives.\n\nUse `invoke(',
  '## Streaming response\n\nMarkdown stays **readable** while it arrives.\n\nUse `invoke()` and [read the docs](https://docs.lang',
  '## Streaming response\n\nMarkdown stays **readable** while it arrives.\n\nUse `invoke()` and [read the docs](https://docs.langchain.com).\n\n```typescript\nconst message = "Hello";',
  '## Streaming response\n\nMarkdown stays **readable** while it arrives.\n\nUse `invoke()` and [read the docs](https://docs.langchain.com).\n\n```typescript\nconst message = "Hello";\nconsole.log(message);\n```\n\n- [x] Delivered\n- [ ] Next task',
];

function StreamingChatExample() {
  const [chunk, setChunk] = useState(0);
  const [running, setRunning] = useState(false);
  const isStreaming = chunk < STREAMING_CHUNKS.length - 1;

  useEffect(() => {
    if (!running || !isStreaming) return;
    const timeout = window.setTimeout(() => setChunk(chunk + 1), 500);
    return () => window.clearTimeout(timeout);
  }, [chunk, running, isStreaming]);

  return (
    <div className="flex flex-col gap-space-4">
      <div className="flex flex-wrap gap-space-2">
        <Button disabled={!isStreaming} onClick={() => setRunning(!running)}>
          {running && isStreaming ? 'Pause' : 'Stream response'}
        </Button>
        <Button
          color="secondary"
          disabled={!isStreaming || running}
          onClick={() => setChunk(chunk + 1)}
        >
          Next chunk
        </Button>
        <Button
          variant="plain"
          color="secondary"
          onClick={() => {
            setRunning(false);
            setChunk(0);
          }}
        >
          Restart
        </Button>
      </div>
      <ChatMessage
        isLatest
        message={{
          id: 'streaming-answer',
          role: 'assistant',
          status: isStreaming ? 'streaming' : 'completed',
          content: [
            {
              id: 'streaming-markdown',
              type: 'custom',
              content: (
                <MarkdownDisplay
                  content={STREAMING_CHUNKS[chunk]}
                  isStreaming={isStreaming}
                />
              ),
            },
          ],
        }}
      />
    </div>
  );
}

export const StreamingInChat: Story = {
  render: () => <StreamingChatExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByRole('article', { name: 'Assistant message' });
    await expect(message).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByText('readable').tagName).toBe('STRONG');
    await userEvent.click(canvas.getByRole('button', { name: 'Next chunk' }));
    await expect(canvas.getByText('invoke(').tagName).toBe('CODE');
    await userEvent.click(canvas.getByRole('button', { name: 'Next chunk' }));
    await expect(
      canvas.queryByRole('link', { name: 'read the docs' })
    ).toBeNull();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Stream response' })
    );
    await waitFor(() => expect(message).toHaveAttribute('aria-busy', 'false'), {
      timeout: 3_000,
    });
    await expect(
      canvas.getByRole('link', { name: 'read the docs' })
    ).toHaveAttribute('href', 'https://docs.langchain.com');
    await expect(
      canvas.getByRole('region', { name: 'typescript' })
    ).toHaveTextContent('console.log(message);');
    await expect(
      canvas.getByRole('checkbox', { name: 'Delivered' })
    ).toBeChecked();
  },
};

export const XmlCompatibility: Story = {
  args: { content: PREPARED_XML },
  parameters: {
    docs: {
      description: {
        story:
          'Receives the Markdown emitted by Run Details’ prepareMarkdownText adapter. Keep that application preprocessing when adopting MarkdownDisplay to preserve XML labels and nested sections.',
      },
    },
  },
};

export const LiteralXmlTags: Story = {
  args: { content: XML_SOURCE },
};

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
