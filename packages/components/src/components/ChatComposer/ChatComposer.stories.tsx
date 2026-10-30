import { useState, type ReactNode } from 'react';

import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { StopIcon } from '@phosphor-icons/react/dist/ssr/Stop';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerAttachment,
  ChatComposerAttachmentMenu,
  ChatComposerAttachments,
  ChatComposerInput,
  ChatComposerModelSelect,
  ChatComposerToolbar,
} from '.';
import type {
  ChatComposerAttachmentProps,
  ChatComposerAttachmentsProps,
  ChatComposerDrawerIntent,
  ChatComposerProps,
} from '.';
import sampleImage from '../../stories/assets/attachment-preview.png';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { DropdownMenuItem, DropdownMenuSeparator } from '../DropdownMenu';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import { ThinkingState } from '../ThinkingState';
import { Tooltip } from '../Tooltip';

const meta = {
  title: 'Components/Chat/ChatComposer',
  component: ChatComposer,
  tags: [
    'autodocs',
    'chat',
    'composer',
    'prompt',
    'message',
    'send',
    'stop',
    'drawer',
    'input',
    'markdown',
    'code',
    'attachments',
    'upload',
    'model',
    'ai',
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Composable Markdown input with editable code blocks, attachments, model selection, and toolbar slots. Import from `@langchain/macaw-components/ChatComposer`.',
          'Control the draft with `value`/`onChange`; consumers handle sending, uploads, and streaming. Use `action="stop"` with `onStop` during generation.',
          'Use `drawer` for content attached above the editor, such as questions the reader answers before sending; the composer still owns submission. An input ref exposes `focus()` for external controls.',
          'Menu `accept`/`multiple` configure the picker only; validate all files in `onFilesSelected`.',
          '`ChatComposerInput` grows from `minHeight` (40px) to `maxHeight` (240px).',
          'Enter sends from plain paragraphs; Shift+Enter continues editing; Ctrl/⌘+Enter sends from any block. Three backticks create a code block.',
          'Without `onSubmit`, Enter inserts paragraphs. Otherwise, send shortcuts stay reserved when `submitDisabled` or `action="stop"` blocks sending; Shift+Enter still edits.',
          'Examples use local state only.',
        ].join('\n\n'),
      },
    },
  },
} satisfies Meta<typeof ChatComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

interface DemoAttachment extends Pick<
  ChatComposerAttachmentProps,
  | 'name'
  | 'status'
  | 'contentType'
  | 'metadata'
  | 'variant'
  | 'preview'
  | 'size'
> {
  id: string;
}

interface ComposerDemoProps {
  initialDraft?: string;
  initialAttachments?: DemoAttachment[];
  attachmentAppearance?: Pick<ChatComposerAttachmentsProps, 'size' | 'variant'>;
  initialResponding?: boolean;
  queueWhileRunning?: boolean;
  narrow?: boolean;
  showTools?: boolean;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  drawer?: ReactNode;
  drawerIntent?: ChatComposerDrawerIntent;
}

const MODEL_OPTIONS = [
  {
    value: 'balanced',
    label: 'Balanced model',
    description: 'For everyday tasks',
  },
  {
    value: 'reasoning',
    label: 'Reasoning model',
    description: 'For complex tasks',
  },
  { value: 'custom', label: 'Custom model with a longer display name' },
];

function ToolsToggle() {
  const [enabled, setEnabled] = useState(false);
  const label = enabled ? 'Tools enabled' : 'Tools';

  return (
    <Tooltip title={label}>
      <Button
        type="button"
        size="sm"
        color="secondary"
        variant="plain"
        className="w-6 shrink-0 px-0 @[440px]/composer:w-auto @[440px]/composer:px-space-2"
        aria-label={label}
        aria-pressed={enabled}
        onClick={() => setEnabled(!enabled)}
      >
        <SparkleIcon
          size={16}
          weight={enabled ? 'fill' : 'regular'}
          aria-hidden
        />
        <span className="hidden @[440px]/composer:inline-block">{label}</span>
      </Button>
    </Tooltip>
  );
}

function ComposerDemo({
  initialDraft = '',
  initialAttachments = [],
  attachmentAppearance,
  initialResponding = false,
  queueWhileRunning = false,
  narrow = false,
  showTools = false,
  disabled = false,
  minHeight,
  maxHeight,
  drawer,
  drawerIntent,
}: ComposerDemoProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [model, setModel] = useState('balanced');
  const [attachments, setAttachments] = useState(initialAttachments);
  const [isResponding, setIsResponding] = useState(initialResponding);
  const [queuedCount, setQueuedCount] = useState(0);
  const [notice, setNotice] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const hasPendingAttachments = attachments.some(
    (file) =>
      file.status === 'loading' ||
      file.status === 'uploading' ||
      file.status === 'error'
  );
  const canSubmit =
    Boolean(draft.trim() || attachments.length) && !hasPendingAttachments;

  const stop = () => {
    setIsResponding(false);
    setNotice('Response stopped. Your draft is preserved.');
  };
  const actionProps: ChatComposerProps =
    isResponding && !queueWhileRunning
      ? { action: 'stop', onStop: stop }
      : { action: 'send' };

  return (
    <div
      className={cn(
        'mx-auto flex w-full min-w-0 flex-col gap-space-4',
        narrow ? 'max-w-80' : 'max-w-2xl'
      )}
    >
      {isResponding && <ThinkingState label="Responding" />}
      {queuedCount > 0 && (
        <Text variant="xs" color="secondary">
          {queuedCount} follow-up messages queued
        </Text>
      )}
      <ChatComposer
        {...actionProps}
        drawer={drawer}
        drawerIntent={drawerIntent}
        disabled={disabled}
        submitDisabled={!canSubmit}
        aria-label="Chat composer"
        onFilesSelected={(files) => {
          setAttachments((current) => [
            ...current,
            ...files.map<DemoAttachment>((file) => ({
              id: crypto.randomUUID(),
              name: file.name,
              contentType: file.type,
              status: 'ready',
            })),
          ]);
          setNotice('Files selected for this demo. No files are uploaded.');
        }}
        onSubmit={() => {
          setLastMessage(draft || '(Attachments only)');
          setDraft('');
          setAttachments([]);
          if (isResponding && queueWhileRunning) {
            setQueuedCount((count) => count + 1);
            setNotice('Follow-up queued in this demo.');
          } else {
            setIsResponding(true);
            setNotice('Message submitted in this demo. Select Stop to finish.');
          }
        }}
      >
        {attachments.length > 0 && (
          <ChatComposerAttachments {...attachmentAppearance}>
            {attachments.map(({ id, ...attachment }) => (
              <ChatComposerAttachment
                key={id}
                {...attachment}
                onRemove={() =>
                  setAttachments((current) =>
                    current.filter((item) => item.id !== id)
                  )
                }
              />
            ))}
          </ChatComposerAttachments>
        )}
        <ChatComposerInput
          value={draft}
          onChange={setDraft}
          minHeight={minHeight}
          maxHeight={maxHeight}
          placeholder={
            narrow ? 'Ask a question…' : 'Ask a question or describe a task…'
          }
        />
        <ChatComposerToolbar
          modelSelector={
            <ChatComposerModelSelect
              options={MODEL_OPTIONS}
              value={model}
              onChange={(next) => next && setModel(next)}
            />
          }
          actions={
            queueWhileRunning && isResponding ? (
              <>
                <IconButton
                  type="button"
                  icon={StopIcon}
                  iconWeight="regular"
                  label="Stop response"
                  color="secondary"
                  round
                  size="sm"
                  onClick={stop}
                />
                <ChatComposerAction label="Queue message" />
              </>
            ) : undefined
          }
        >
          <ChatComposerAttachmentMenu size="sm">
            {showTools && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    setAttachments((current) => [
                      ...current,
                      {
                        id: crypto.randomUUID(),
                        name: 'Workspace context',
                        status: 'ready',
                      },
                    ]);
                  }}
                >
                  <Text as="span" variant="sm">
                    Add sample workspace context
                  </Text>
                </DropdownMenuItem>
              </>
            )}
          </ChatComposerAttachmentMenu>
          {showTools && <ToolsToggle />}
        </ChatComposerToolbar>
      </ChatComposer>
      <Text variant="xs" color="quaternary">
        Ctrl/⌘+Enter to send, Shift+Enter for a new line
      </Text>
      <Text variant="xs" color="secondary" role="status">
        {notice}
      </Text>
      {lastMessage && (
        <div className="flex min-w-0 flex-col gap-space-2">
          <Text variant="xs" color="secondary">
            Submitted Markdown
          </Text>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface-level-2 p-space-3 font-mono text-xs text-secondary">
            {lastMessage}
          </pre>
        </div>
      )}
    </div>
  );
}

export const Default: Story = {
  tags: ['a11y-test'],
  render: () => <ComposerDemo />,
};

export const ConfigurableHeight: Story = {
  render: () => <ComposerDemo minHeight={120} maxHeight={320} />,
};

export const RichDraft: Story = {
  tags: ['a11y-test'],
  render: () => (
    <ComposerDemo
      initialDraft={
        'Help me improve this **Python function**:\n\n```python\ndef greet(name):\n    return f"Hello, {name}!"\n```\n\n- Handle an empty name\n- Keep the response concise'
      }
    />
  ),
};

export const Toolbar: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-space-6">
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          Regular
        </Text>
        <ComposerDemo
          showTools
          initialDraft="Review the attached instructions and suggest a plan."
        />
      </div>
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          Compact (240px)
        </Text>
        <div className="w-60 max-w-full">
          <ComposerDemo showTools initialResponding queueWhileRunning />
        </div>
      </div>
    </div>
  ),
};

export const NarrowWithExtraControls: Story = {
  tags: ['a11y-test'],
  render: () => <ComposerDemo narrow showTools />,
};

export const AttachmentStates: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="mx-auto flex w-full max-w-80 flex-col gap-space-6">
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          Files
        </Text>
        <ComposerDemo
          narrow
          initialAttachments={[
            {
              id: 'ready',
              name: 'experiment-results-with-a-long-filename.csv',
              status: 'ready',
            },
            { id: 'uploading', name: 'screenshot.png', status: 'uploading' },
            {
              id: 'error',
              name: 'archive.zip',
              status: 'error',
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          Thumbnails
        </Text>
        <ComposerDemo
          narrow
          attachmentAppearance={{ size: 'md', variant: 'thumbnail' }}
          initialAttachments={[
            {
              id: 'image',
              name: 'reference.png',
              contentType: 'image/png',
              preview: <img src={sampleImage} alt="" />,
              metadata: '340 KB',
            },
            {
              id: 'screenshot',
              name: 'screenshot.png',
              contentType: 'image/png',
              preview: <img src={sampleImage} alt="" />,
              metadata: '520 KB',
            },
            {
              id: 'loading',
              name: 'design-preview.png',
              contentType: 'image/png',
              status: 'loading',
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const WhileStreaming: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-space-6">
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          Draft while streaming
        </Text>
        <ComposerDemo
          narrow
          initialResponding
          initialDraft="Here is my follow-up question…"
        />
      </div>
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          Queue while streaming
        </Text>
        <ComposerDemo
          showTools
          initialResponding
          queueWhileRunning
          initialDraft="Then add a summary of the results."
        />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  tags: ['a11y-test'],
  render: () => (
    <ComposerDemo
      disabled
      initialDraft="A saved draft remains visible."
      initialAttachments={[
        { id: 'saved', name: 'context.txt', status: 'ready' },
        {
          id: 'image',
          name: 'reference.png',
          variant: 'thumbnail',
          preview: <img src={sampleImage} alt="" />,
        },
      ]}
    />
  ),
};

const DRAWER_EXAMPLES: {
  intent: ChatComposerDrawerIntent;
  title: string;
  message: string;
  icon?: typeof InfoIcon;
  iconClassName?: string;
}[] = [
  {
    intent: 'neutral',
    title: 'Neutral',
    message: 'Answer two questions before the agent continues.',
  },
  {
    intent: 'info',
    title: 'Info',
    message: 'Replies use the workspace knowledge base.',
    icon: InfoIcon,
    iconClassName: 'text-brand-primary',
  },
  {
    intent: 'warning',
    title: 'Warning',
    message: 'This run will edit 14 files in the main branch.',
    icon: WarningIcon,
    iconClassName: 'text-warning-primary',
  },
  {
    intent: 'error',
    title: 'Error',
    message: 'The last tool call failed. Retry or change the request.',
    icon: WarningCircleIcon,
    iconClassName: 'text-error-primary',
  },
];

export const DrawerIntents: Story = {
  tags: ['a11y-test'],
  parameters: {
    docs: {
      description: {
        story:
          '`drawerIntent` sets the drawer surface: `neutral` (default), `info`, `warning`, or `error`. Color alone does not convey severity, so state it in the drawer content too.',
      },
    },
  },
  render: () => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-space-6">
      {DRAWER_EXAMPLES.map(
        ({ intent, title, message, icon: Icon, iconClassName }) => (
          <ComposerDemo
            key={intent}
            drawerIntent={intent}
            drawer={
              <div className="flex items-start gap-space-2 px-space-3 py-space-3">
                {Icon && (
                  <Icon
                    size={16}
                    weight="regular"
                    aria-hidden
                    className={cn('mt-0.5 shrink-0', iconClassName)}
                  />
                )}
                <Text variant="sm">
                  <span className="font-medium">{title}: </span>
                  {message}
                </Text>
              </div>
            }
          />
        )
      )}
    </div>
  ),
};
