import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../Text';
import { CodeLite } from './CodeLite';

const SAMPLE_CODE = `{
  "name": "docs-search",
  "sources": [
    "guides",
    "reference"
  ],
  "settings": {
    "limit": 10,
    "includeSources": true
  }
}`;

const ORIGINAL_CODE = `export function buildSearchRequest(query: string) {
  return {
    query: query.trim(),
    limit: 5,
  };
}
`;

const UPDATED_CODE = `export function buildSearchRequest(query: string) {
  return {
    query: query.trim(),
    limit: 10,
    includeSources: true,
  };
}
`;

const meta = {
  title: 'Components/Display/CodeLite',
  component: CodeLite,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '- Lightweight read-only code with optional gutters, folding, and virtualization. Use `Code` for editing.',
          '- `variant="block"` adds a label, copy toolbar, and keyboard-accessible scrolling; plain is the default.',
          '- `variant="diff"` compares `oldString` and `newString`; the toolbar stays visible when there are no changes. The diff renderer loads on demand.',
          '- Set `label` for a filename or language name; replace the header with `toolbar` (`null` hides it).',
          '- Use `plaintext` for unhighlighted text and `wrapLines` for long lines. `className` styles the content; virtualized content needs a height.',
        ].join('\n'),
      },
    },
  },
  tags: [
    'autodocs',
    'read only',
    'code',
    'syntax highlighting',
    'json',
    'diff',
    'file changes',
  ],
  args: {
    language: 'json',
    value: SAMPLE_CODE,
    showGutter: true,
    wrapLines: true,
  },
  argTypes: {
    variant: { control: 'radio', options: ['plain', 'block'] },
    language: {
      control: 'select',
      options: ['plaintext', 'typescript', 'python', 'shell', 'yaml', 'json'],
    },
    label: { control: 'text' },
    toolbar: { control: false },
  },
} satisfies Meta<typeof CodeLite>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  args: { label: 'search-config.json', showGutter: false },
  render: (args) => {
    if (args.variant === 'diff') return <CodeLite {...args} />;
    return (
      <div className="gap-space-6 grid max-w-4xl sm:grid-cols-2">
        <section className="gap-space-3 flex min-w-0 flex-col">
          <Text as="h3" variant="sm">
            Plain
          </Text>
          <CodeLite {...args} variant="plain" />
        </section>
        <section className="gap-space-3 flex min-w-0 flex-col">
          <Text as="h3" variant="sm">
            Block
          </Text>
          <CodeLite {...args} variant="block" />
        </section>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: [
          '- The same code in plain and block variants.',
          '- Block adds a filename, copy action, and keyboard-focusable code region.',
        ].join('\n'),
      },
    },
  },
};

export const WithoutGutter: Story = {
  args: {
    showGutter: false,
  },
};

export const Overflow: Story = {
  args: {
    variant: 'block',
    showGutter: false,
    value:
      '{ "description": "The run retrieved three documents and generated a response with references and supporting details." }',
  },
  render: (args) => {
    if (args.variant === 'diff') return <CodeLite {...args} />;
    return (
      <div className="gap-space-6 grid sm:grid-cols-2 lg:grid-cols-3">
        <section className="w-72 max-w-full min-w-0">
          <Text as="h3" variant="sm" className="mb-space-3">
            Scroll long lines
          </Text>
          <CodeLite {...args} wrapLines={false} />
        </section>
        <section className="w-72 max-w-full min-w-0">
          <Text as="h3" variant="sm" className="mb-space-3">
            Wrap long lines
          </Text>
          <CodeLite {...args} wrapLines />
        </section>
        <section className="w-72 max-w-full min-w-0">
          <Text as="h3" variant="sm" className="mb-space-3">
            Scroll many lines
          </Text>
          <CodeLite
            {...args}
            language="plaintext"
            label="search.log"
            virtualize
            className="!h-48"
            value={Array.from(
              { length: 40 },
              (_, index) => `Result ${index + 1}: document retrieved`
            ).join('\n')}
          />
        </section>
      </div>
    );
  },
};

export const VirtualizedBlock: Story = {
  args: {
    variant: 'block',
    language: 'plaintext',
    label: 'output.log',
    virtualize: true,
    // Override the virtualizer's inline 100% height with a bounded viewport.
    className: '!h-64',
    value: Array.from(
      { length: 500 },
      (_, index) => `Step ${index + 1}: completed`
    ).join('\n'),
  },
};

export const Diff: Story = {
  render: () => (
    <div className="gap-space-6 flex w-full max-w-3xl min-w-0 flex-col">
      <section className="gap-space-3 flex min-w-0 flex-col">
        <Text as="h3" variant="sm">
          With changes
        </Text>
        <CodeLite
          variant="diff"
          fileName="search.ts"
          oldString={ORIGINAL_CODE}
          newString={UPDATED_CODE}
        />
      </section>
      <section className="gap-space-3 flex min-w-0 flex-col">
        <Text as="h3" variant="sm">
          Without changes
        </Text>
        <CodeLite
          variant="diff"
          fileName="search.ts"
          oldString={UPDATED_CODE}
          newString={UPDATED_CODE}
        />
      </section>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
