import type { ReactNode } from 'react';

import { fn } from 'storybook/test';

import { GithubLogoIcon } from '@phosphor-icons/react/dist/ssr/GithubLogo';
import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { NotionLogoIcon } from '@phosphor-icons/react/dist/ssr/NotionLogo';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { SlackLogoIcon } from '@phosphor-icons/react/dist/ssr/SlackLogo';
import { TerminalIcon } from '@phosphor-icons/react/dist/ssr/Terminal';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  type ChatToolCallModel,
  type ChatToolCallProps,
} from '.';
import { CodeLite } from '../Code/CodeLite';
import { Text } from '../Text';

const exampleCall: ChatToolCallModel = {
  id: 'search-1',
  name: 'search_documents',
  status: 'succeeded',
  args: { query: 'Deployment instructions' },
  result: { matches: ['Deployment guide', 'Release checklist'] },
  elapsedMs: 2_400,
};

const invalidSearchCall: ChatToolCallModel = {
  ...exampleCall,
  id: 'invalid',
  args: { query: 42 },
  result: '<script>alert(1)</script>',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function getSearchToolCallPresentation(
  toolCall: ChatToolCallModel
): Pick<ChatToolCallProps, 'children' | 'icon' | 'summary'> {
  if (!isRecord(toolCall.args) || typeof toolCall.args.query !== 'string') {
    return {};
  }

  const query = toolCall.args.query;
  const result = toolCall.result;
  let matches: string[] | undefined;
  if (result !== undefined) {
    if (!isRecord(result) || !isStringArray(result.matches)) return {};
    matches = result.matches;
  }

  return {
    icon: <MagnifyingGlassIcon size={12} weight="regular" />,
    summary: matches ? `${matches.length} documents found` : query,
    children: (
      <div className="flex flex-col gap-space-2">
        <Text variant="xs" weight="semibold" color="tertiary">
          {query}
        </Text>
        {matches?.map((title, index) => (
          <Text key={index} variant="xs" color="tertiary">
            {title}
          </Text>
        ))}
      </div>
    ),
  };
}

const variants: NonNullable<ChatToolCallProps['variant']>[] = [
  'default',
  'simple',
];

const inspectToolCall = fn();

const updatedDateCode = `export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US').format(date);
}`;

function ToolCallVariants({
  children,
}: {
  children: (variant: NonNullable<ChatToolCallProps['variant']>) => ReactNode;
}) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 items-start gap-space-5">
      {variants.map((variant) => (
        <section key={variant} className="flex min-w-0 flex-col gap-space-2">
          <Text variant="xs" color="tertiary">
            {variant === 'simple' ? 'Simple' : 'Default'}
          </Text>
          {children(variant)}
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/Chat/ChatToolCall',
  component: ChatToolCall,
  render: (args) => (
    <ToolCallVariants>
      {(variant) => <ChatToolCall {...args} variant={variant} />}
    </ToolCallVariants>
  ),
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `- Default shows summaries and expandable details; Simple is a status-only row.
- Hosts supply \`onInspect\` for Simple's clickable row, decide whether to open a pane or dialog, and can describe the action with \`inspectLabel\` (default: “View tool details”).
- Every row leads with a 12px single-color icon. Hosts map product or provider icons through \`icon\`; without one the row uses a generic wrench, and \`null\` omits it.
- Succeeded rows show no status; every other state keeps its own icon, so a quiet row means done.
- Hosts validate tool-specific payloads before passing presentation slots; unknown payloads use the generic fallback.
- Preserve content order and stable IDs; \`ChatToolCallGroup\` provides the outer accordion for both variants.`,
      },
    },
  },
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'tool',
    'tool-call',
    'disclosure',
    'status',
    'reasoning',
  ],
  args: {
    toolCall: exampleCall,
    onInspect: inspectToolCall,
    onExpandedChange: fn(),
  },
  argTypes: {
    variant: { control: false },
    onInspect: { control: false },
    toolCall: { control: 'object' },
    defaultExpanded: { control: 'boolean' },
    expanded: { control: 'boolean' },
    icon: { control: false },
    summary: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story, context) => (
      <div
        className={
          context.parameters.layout === 'fullscreen'
            ? 'mx-auto w-full max-w-7xl p-space-4'
            : 'w-[50rem] max-w-full'
        }
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToolCallVariants>
      {(variant) => (
        <ChatToolCallGroup label="3 tool calls" defaultExpanded>
          <ChatToolCall
            variant={variant}
            onInspect={inspectToolCall}
            toolCall={{
              id: 'edit',
              name: 'edit_file',
              status: 'succeeded',
              elapsedMs: 85,
            }}
            label="Edit file"
            icon={<PencilSimpleIcon size={12} weight="regular" />}
            summary="src/utils/formatDate.ts"
            defaultExpanded
          >
            <div className="flex min-w-0 flex-col gap-space-2">
              <Text variant="xs" color="tertiary">
                Updated date formatting.
              </Text>
              <div className="max-h-60 max-w-full overflow-auto rounded-md bg-surface-level-2 p-space-2 [overflow-wrap:anywhere]">
                <CodeLite
                  language="typescript"
                  value={updatedDateCode}
                  className="text-xxs"
                  showGutter={false}
                  wrapLines
                />
              </div>
            </div>
          </ChatToolCall>
          <ChatToolCall
            variant={variant}
            onInspect={inspectToolCall}
            toolCall={{
              id: 'shell',
              name: 'bash',
              status: 'succeeded',
              args: { command: 'yarn test' },
              result: '2 test suites passed.\n14 tests passed.',
              elapsedMs: 1_800,
            }}
            label="Run tests"
            icon={<TerminalIcon size={12} weight="regular" />}
            summary="yarn test"
            defaultExpanded
          />
          <ChatToolCall
            toolCall={exampleCall}
            {...getSearchToolCallPresentation(exampleCall)}
            variant={variant}
            onInspect={inspectToolCall}
          />
          <ChatToolCallReasoning status="completed">
            <Text variant="xs" color="tertiary">
              The document search and test results support the final response.
            </Text>
          </ChatToolCallReasoning>
        </ChatToolCallGroup>
      )}
    </ToolCallVariants>
  ),
};

const stateCalls: ChatToolCallModel[] = [
  { id: 'pending', name: 'search_documents', status: 'pending' },
  {
    id: 'running',
    name: 'search_documents',
    status: 'running',
    elapsedMs: 1_800,
  },
  exampleCall,
  {
    id: 'failed',
    name: 'search_documents',
    status: 'failed',
    error: 'The request timed out.',
  },
  { id: 'canceled', name: 'search_documents', status: 'canceled' },
  {
    id: 'question',
    name: 'ask_user',
    status: 'input-required',
    args: { question: 'Which environment?' },
  },
];

export const States: Story = {
  render: () => (
    <ToolCallVariants>
      {(variant) => (
        <div className="flex flex-col gap-0">
          {stateCalls.map((toolCall) => (
            <ChatToolCall
              key={toolCall.id}
              toolCall={toolCall}
              variant={variant}
              onInspect={inspectToolCall}
            />
          ))}
        </div>
      )}
    </ToolCallVariants>
  ),
};

export const ToolContent: Story = {
  render: () => (
    <ToolCallVariants>
      {(variant) => (
        <div className="flex flex-col">
          <ChatToolCall
            variant={variant}
            label="Custom display"
            onInspect={inspectToolCall}
            toolCall={exampleCall}
            {...getSearchToolCallPresentation(exampleCall)}
            defaultExpanded
          />
          <ChatToolCall
            variant={variant}
            label="Unknown tool"
            onInspect={inspectToolCall}
            toolCall={{
              id: 'unknown',
              name: 'future_tool',
              status: 'succeeded',
              result: '<img src="https://example.invalid/image">',
            }}
            defaultExpanded
          />
          <ChatToolCall
            variant={variant}
            label="Invalid data"
            onInspect={inspectToolCall}
            toolCall={invalidSearchCall}
            {...getSearchToolCallPresentation(invalidSearchCall)}
            defaultExpanded
          />
        </div>
      )}
    </ToolCallVariants>
  ),
};

const iconCalls: {
  toolCall: ChatToolCallModel;
  label: string;
  icon?: ChatToolCallProps['icon'];
  summary?: string;
}[] = [
  {
    toolCall: { id: 'notion', name: 'notion-search', status: 'succeeded' },
    label: 'Search Notion',
    icon: <NotionLogoIcon size={12} weight="regular" />,
    summary: 'Q3 platform roadmap',
  },
  {
    toolCall: {
      id: 'github',
      name: 'github_create_issue',
      status: 'input-required',
    },
    label: 'Create GitHub issue',
    icon: <GithubLogoIcon size={12} weight="regular" />,
    summary: 'Retry policy ignores maxAttempts',
  },
  {
    toolCall: {
      id: 'slack',
      name: 'slack_write_private_message',
      status: 'running',
      elapsedMs: 3_400,
    },
    label: 'Send Slack message',
    icon: <SlackLogoIcon size={12} weight="regular" />,
    summary: '@platform-oncall',
  },
  {
    toolCall: { id: 'web', name: 'tavily_web_search', status: 'failed' },
    label: 'Search the web',
    icon: <GlobeIcon size={12} weight="regular" />,
    summary: 'exponential backoff cap',
  },
  {
    toolCall: { id: 'time', name: 'get_current_time', status: 'succeeded' },
    label: 'Get current time',
  },
];

export const Icons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Hosts pass product or provider marks as single-color 12px icons. Tools without a mapping fall back to the wrench, so every row keeps the same leading column.',
      },
    },
  },
  render: () => (
    <ToolCallVariants>
      {(variant) => (
        <ChatToolCallGroup label="5 tool calls" defaultExpanded>
          {iconCalls.map(({ toolCall, label, icon, summary }) => (
            <ChatToolCall
              key={toolCall.id}
              variant={variant}
              onInspect={inspectToolCall}
              toolCall={toolCall}
              label={label}
              icon={icon}
              summary={summary}
            />
          ))}
        </ChatToolCallGroup>
      )}
    </ToolCallVariants>
  ),
};

export const NarrowWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Long names and summaries truncate without forcing the conversation wider. Each column is 16rem wide. Expand the default row to verify wrapped detail content.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-[33.5rem] min-w-0">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <ToolCallVariants>
      {(variant) => (
        <ChatToolCall
          variant={variant}
          onInspect={inspectToolCall}
          toolCall={{
            id: 'narrow-search',
            name: 'search_documents_with_a_very_long_tool_name',
            status: 'succeeded',
            args: { query: 'A long deployment readiness query' },
            result:
              'A long response that wraps within the available detail width.',
          }}
          summary="A long summary that stays within a narrow conversation"
          defaultExpanded
        />
      )}
    </ToolCallVariants>
  ),
};
