import type { ReactNode } from 'react';

import { fn } from 'storybook/test';
import { z } from 'zod';

import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { LineSegmentIcon } from '@phosphor-icons/react/dist/ssr/LineSegment';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  type ChatToolCallModel,
  type ChatToolCallProps,
} from '.';
import { ChatConversation } from '../ChatConversation';
import {
  ChatMessage,
  ChatMessageActions,
  type ChatMessageModel,
} from '../ChatMessage';
import { CodeLite } from '../Code/CodeLite';
import { IconButton } from '../IconButton';
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

const searchSchema = z.object({
  args: z.object({ query: z.string() }),
  result: z.object({ matches: z.array(z.string()) }).optional(),
});

function getSearchToolCallPresentation(
  toolCall: ChatToolCallModel
): Pick<ChatToolCallProps, 'children' | 'icon' | 'summary'> {
  const parsed = searchSchema.safeParse({
    args: toolCall.args,
    result: toolCall.result,
  });
  if (!parsed.success) return {};

  return {
    icon: <MagnifyingGlassIcon size={12} weight="regular" />,
    summary: parsed.data.result
      ? `${parsed.data.result.matches.length} documents found`
      : parsed.data.args.query,
    children: (
      <div className="flex flex-col gap-space-2">
        <Text variant="xs" weight="semibold" color="tertiary">
          {parsed.data.args.query}
        </Text>
        {parsed.data.result?.matches.map((title, index) => (
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
- Hosts supply \`onInspect\` for Simple's clickable row and decide whether to open a pane or a new tab.
- Hosts validate tool-specific payloads before passing presentation slots; unknown payloads use the generic fallback.
- Preserve content order and stable IDs; \`ChatToolCallGroup\` provides the outer accordion for both variants.`,
      },
    },
  },
  tags: [
    'autodocs',
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
            summary="yarn test"
            defaultExpanded
          />
          <ChatToolCall
            toolCall={exampleCall}
            {...getSearchToolCallPresentation(exampleCall)}
            variant={variant}
            onInspect={inspectToolCall}
          />
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

interface InContextMessage extends ChatMessageModel {
  timestamp: { dateTime: string; label: string };
  usage?: { tokens: string; cost: string; model: string };
}

const messageActions = {
  copy: { onClick: fn() },
  viewTrace: fn(),
};

function getInContextMessages(
  variant: ChatToolCallProps['variant']
): InContextMessage[] {
  return [
    {
      id: 'readiness-question',
      role: 'user',
      status: 'completed',
      timestamp: {
        dateTime: '2026-10-01T16:30:00-04:00',
        label: '4:30 PM',
      },
      content: [
        {
          id: 'readiness-request',
          type: 'text',
          appearance: 'bubble',
          text: 'Check staging readiness using the deployment guide. Don’t deploy.',
        },
      ],
    },
    {
      id: 'readiness-answer',
      role: 'assistant',
      status: 'completed',
      timestamp: {
        dateTime: '2026-10-01T16:31:00-04:00',
        label: '4:31 PM',
      },
      usage: { tokens: '16.09K', cost: '$0.0033', model: 'gpt-5.4-nano' },
      content: [
        {
          id: 'search-introduction',
          type: 'text',
          text: 'I’ll find the guide and inspect staging.',
        },
        {
          id: 'document-search',
          type: 'custom',
          content: (
            <ChatToolCall
              toolCall={exampleCall}
              {...getSearchToolCallPresentation(exampleCall)}
              variant={variant}
              onInspect={inspectToolCall}
            />
          ),
        },
        {
          id: 'inspection-introduction',
          type: 'text',
          text: 'The guide recommends checking environment health first.',
        },
        {
          id: 'target-inspection',
          type: 'custom',
          content: (
            <ChatToolCallGroup label="1 tool call" defaultExpanded>
              <ChatToolCall
                variant={variant}
                onInspect={inspectToolCall}
                toolCall={{
                  id: 'staging-target',
                  name: 'inspect_target',
                  status: 'succeeded',
                  args: { target: 'staging' },
                  result: { health: 'healthy', pendingDeployments: 0 },
                  elapsedMs: 1_200,
                }}
                summary="Staging is healthy"
              />
              <ChatToolCallReasoning
                variant={variant}
                onInspect={inspectToolCall}
              >
                <Text variant="xs">
                  Health checks passed; release checks are still required.
                </Text>
              </ChatToolCallReasoning>
            </ChatToolCallGroup>
          ),
        },
        {
          id: 'readiness-summary',
          type: 'text',
          text: 'Staging is healthy. Release checks are next.',
        },
      ],
    },
    {
      id: 'preflight-question',
      role: 'user',
      status: 'completed',
      timestamp: {
        dateTime: '2026-10-01T16:32:00-04:00',
        label: '4:32 PM',
      },
      content: [
        {
          id: 'preflight-request',
          type: 'text',
          appearance: 'bubble',
          text: 'Run the release checks, but don’t deploy.',
        },
      ],
    },
    {
      id: 'preflight-answer',
      role: 'assistant',
      status: 'streaming',
      timestamp: {
        dateTime: '2026-10-01T16:33:00-04:00',
        label: '4:33 PM',
      },
      content: [
        {
          id: 'preflight-introduction',
          type: 'text',
          text: 'I’ll validate the release configuration and run smoke tests.',
        },
        {
          id: 'preflight-tools',
          type: 'custom',
          content: (
            <ChatToolCallGroup label="2 preflight checks" defaultExpanded>
              <ChatToolCall
                variant={variant}
                onInspect={inspectToolCall}
                toolCall={{
                  id: 'release-checklist',
                  name: 'validate_release',
                  status: 'succeeded',
                  args: { target: 'staging' },
                  elapsedMs: 800,
                }}
                summary="3 checks passed"
              >
                <Text variant="xs" color="tertiary">
                  Configuration, environment variables, and rollback checks
                  passed.
                </Text>
              </ChatToolCall>
              <ChatToolCall
                variant={variant}
                onInspect={inspectToolCall}
                toolCall={{
                  id: 'staging-smoke-tests',
                  name: 'run_smoke_tests',
                  status: 'running',
                  args: { target: 'staging', suite: 'release-preflight' },
                  elapsedMs: 4_200,
                }}
                summary="Staging · release preflight"
              />
            </ChatToolCallGroup>
          ),
        },
        {
          id: 'preflight-progress',
          type: 'text',
          text: 'Release checks passed. Smoke tests are still running.',
        },
      ],
    },
  ];
}

function InContextMetadata({ message }: { message: InContextMessage }) {
  return (
    <>
      <Text as="span" variant="xs" color="quaternary">
        <time dateTime={message.timestamp.dateTime}>
          {message.timestamp.label}
        </time>
      </Text>
      {message.usage && (
        <>
          <LineSegmentIcon
            size={8}
            weight="regular"
            className="size-2 shrink-0 text-icon-tertiary"
            aria-hidden="true"
          />
          <Text as="span" variant="xs" color="quaternary">
            <span className="sr-only">Tokens: </span>
            {message.usage.tokens}
          </Text>
          <LineSegmentIcon
            size={8}
            weight="regular"
            className="size-2 shrink-0 text-icon-tertiary"
            aria-hidden="true"
          />
          <Text as="span" variant="xs" color="quaternary">
            <span className="sr-only">Cost: </span>
            {message.usage.cost}
          </Text>
          <LineSegmentIcon
            size={8}
            weight="regular"
            className="size-2 shrink-0 text-icon-tertiary"
            aria-hidden="true"
          />
          <Text as="span" variant="xs" color="quaternary">
            <span className="sr-only">Model: </span>
            {message.usage.model}
          </Text>
        </>
      )}
      <ChatMessageActions
        actions={{ copy: messageActions.copy }}
        status={message.status}
        readOnly={message.readOnly}
      >
        {message.role === 'assistant' && (
          <IconButton
            size="xs"
            variant="plain"
            color="secondary"
            icon={ArrowRightIcon}
            iconWeight="regular"
            label="View trace"
            onClick={messageActions.viewTrace}
          />
        )}
      </ChatMessageActions>
    </>
  );
}

function InContextExample({
  variant,
}: {
  variant: ChatToolCallProps['variant'];
}) {
  const messages = getInContextMessages(variant);
  return (
    <div className="h-[min(720px,100dvh)]">
      <ChatConversation label="Deployment readiness">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            footer={<InContextMetadata message={message} />}
          />
        ))}
      </ChatConversation>
    </div>
  );
}

export const InContext: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: `- Group adjacent tool and reasoning rows without crossing assistant text.
- Hover or focus completed messages to reveal metadata and actions. Streaming messages hide the footer.`,
      },
    },
  },
  render: () => (
    <ToolCallVariants>
      {(variant) => <InContextExample variant={variant} />}
    </ToolCallVariants>
  ),
};
