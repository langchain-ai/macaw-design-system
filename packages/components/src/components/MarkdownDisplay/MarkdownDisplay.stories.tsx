import { useEffect, useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import { ChatMessage } from '../ChatMessage';
import { Text } from '../Text';
import {
  CDATA_SOURCE,
  PREPARED_XML,
  XML_SOURCE,
} from './__tests__/xmlCompatibilitySample';
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
    'xml',
    'reasoning',
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

const NARROW_CONTENT = `### Structured output

\`\`\`json
{ "description": "This long line preserves code formatting while the code block stays inside its available space, including inside a narrow pane." }
\`\`\`

| Step | Input | Output | Status |
| --- | --- | --- | --- |
| Retrieval | Search query | Retrieved documents | Complete |
| Generation | Retrieved documents | Final response | Complete |

\`a_very_long_identifier_without_spaces_that_should_wrap_in_prose_instead_of_widening_the_entire_surface\``;

export const NarrowWrappingPane: Story = {
  parameters: { a11y: { test: 'error' } },
  args: { content: NARROW_CONTENT, codeOverflow: 'wrap' },
  decorators: [
    (Story) => (
      <div className="w-56 min-w-0 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const code = canvas.getByRole('region', { name: 'json' });
    const table = canvas.getByRole('region', { name: 'Table' });
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.clientWidth + 1
    );
    await expect(table.scrollWidth).toBeGreaterThan(table.clientWidth);
    if (args.codeOverflow === 'scroll') {
      await expect(code.scrollWidth).toBeGreaterThan(code.clientWidth);
    } else {
      await expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth + 1);
    }
    const inlineCode = canvas.getByText(
      'a_very_long_identifier_without_spaces_that_should_wrap_in_prose_instead_of_widening_the_entire_surface'
    );
    await expect(inlineCode.getClientRects().length).toBeGreaterThan(1);
  },
};

export const NarrowScrollingPane: Story = {
  ...NarrowWrappingPane,
  args: { content: NARROW_CONTENT, codeOverflow: 'scroll' },
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
  args: { content: XML_SOURCE, xmlTags: 'sections' },
  parameters: {
    docs: {
      description: {
        story:
          'Renders raw Run Details XML with labeled, nested sections. Already-prepared Markdown remains supported with the default literal mode.',
      },
    },
  },
};

export const PreparedXml: Story = {
  args: { content: PREPARED_XML },
};

export const CdataSections: Story = {
  args: { content: CDATA_SOURCE, xmlTags: 'sections' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'Payload' })
    ).toBeVisible();
    await expect(canvas.getAllByText('[reasoning]')).toHaveLength(1);
    await expect(canvasElement).toHaveTextContent(
      'Literal <reasoning>do not relabel</reasoning> & &lt;tag&gt;.'
    );
    await expect(canvasElement).toHaveTextContent('Split terminator: ]]>.');
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
