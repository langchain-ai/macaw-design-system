import { useState } from 'react';

import { expect, fn, within } from 'storybook/test';

import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatComposer,
  ChatComposerAttachmentMenu,
  ChatComposerInput,
  ChatComposerModelSelect,
  ChatComposerToolbar,
} from '.';
import type { ChatComposerModelOption, ChatComposerModelSelectProps } from '.';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { AnthropicLogo, OpenAILogo } from '../ProviderLogo';
import { Select } from '../Select';
import { Text } from '../Text';
import { MODEL_OPTIONS } from './stories/modelOptions';

const TIER_OPTIONS: ChatComposerModelOption[] = [
  {
    value: 'auto',
    label: 'Auto',
    description: 'Picks a model for each message',
  },
  {
    value: 'fast',
    label: 'Fast model',
    description: 'Quick answers and small edits',
  },
  {
    value: 'balanced',
    label: 'Balanced model',
    description: 'For everyday tasks',
  },
];

const meta = {
  title: 'Components/Chat/ChatComposerModelSelect',
  component: ChatComposerModelSelect,
  args: { options: MODEL_OPTIONS, onChange: fn() },
  tags: [
    'autodocs',
    'chat',
    'composer',
    'model',
    'model picker',
    'model selector',
    'provider',
    'select',
    'ai',
  ],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component: [
          'Shared model picker for `ChatComposerToolbar`’s `modelSelector` slot or standalone use. Import from `@langchain/macaw-components/ChatComposer`.',
          'The host controls `value`/`onChange` and supplies options with optional group headings. Macaw shares model rows, search, and focus handling; products own catalogs, permissions, and routing.',
        ].join('\n\n'),
      },
    },
  },
} satisfies Meta<typeof ChatComposerModelSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

function ComposerFrame({
  disabled = false,
  ...selectProps
}: ChatComposerModelSelectProps & { disabled?: boolean }) {
  const [draft, setDraft] = useState('');
  return (
    <ChatComposer
      disabled={disabled}
      submitDisabled={!draft.trim()}
      onSubmit={(event) => {
        event.preventDefault();
        setDraft('');
      }}
    >
      <ChatComposerInput
        value={draft}
        onChange={setDraft}
        placeholder="Ask a question or describe a task…"
      />
      <ChatComposerToolbar
        modelSelector={<ChatComposerModelSelect {...selectProps} />}
      >
        <ChatComposerAttachmentMenu size="sm" />
      </ChatComposerToolbar>
    </ChatComposer>
  );
}

/** The selected name stays visible on narrow screens; long names truncate in the trigger and wrap in the menu. */
export const Narrow: Story = {
  tags: ['a11y-test'],
  render: function NarrowDemo() {
    const [model, setModel] = useState<string | undefined>('gpt-6');
    const [tier, setTier] = useState<string | undefined>('auto');
    return (
      <div className="flex flex-col gap-space-6">
        <div className="w-72 max-w-full">
          <ComposerFrame
            options={MODEL_OPTIONS}
            value={model}
            onChange={setModel}
          />
        </div>
        <div className="w-72 max-w-full">
          <ComposerFrame
            options={TIER_OPTIONS}
            value={tier}
            onChange={setTier}
          />
        </div>
      </div>
    );
  },
};

/** A disabled composer disables the picker too. */
export const Disabled: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="mx-auto w-full max-w-2xl">
      <ComposerFrame
        disabled
        options={MODEL_OPTIONS}
        value="claude-sonnet-5-5"
        onChange={fn()}
      />
    </div>
  ),
};

const WORKSPACE_MODEL_OPTIONS: ChatComposerModelOption[] = [
  {
    value: 'customer-support',
    label: 'customer-support-production-finetune-2026-11',
    icon: <OpenAILogo className="size-4" />,
    group: 'Workspace Models',
    description:
      'Ask a workspace admin to connect the provider before using this model.',
    disabled: true,
    badge: (
      <Badge color="secondary" size="sm">
        Needs API key
      </Badge>
    ),
  },
];

const WORKSPACE_OPTIONS: ChatComposerModelOption[] = [
  ...MODEL_OPTIONS,
  ...WORKSPACE_MODEL_OPTIONS,
  {
    value: 'auto',
    label: 'Auto',
    group: 'LangSmith Hosted',
    icon: <SparkleIcon size={16} weight="regular" />,
    description: 'Chooses a model for each message · 24 of 100 messages used',
  },
];

/** Long workspace model names and credential explanations remain readable at a narrow width. */
export const WorkspaceModels: Story = {
  tags: ['a11y-test'],
  render: function WorkspaceModelsDemo() {
    const [model, setModel] = useState<string | undefined>('eval-judge');
    return (
      <div className="w-80 max-w-full">
        <ComposerFrame
          options={[
            {
              value: 'eval-judge',
              label: 'Evaluation judge',
              group: 'Workspace Models',
              icon: <AnthropicLogo className="size-4" />,
            },
            ...WORKSPACE_MODEL_OPTIONS,
          ]}
          value={model}
          onChange={setModel}
        />
      </div>
    );
  },
};

/** Product-shaped adapters: one picker, with app-owned catalogs, clearing, configuration, and reasoning. These are fixtures, not running product integrations. */
export const ProductAdapters: Story = {
  tags: ['a11y-test'],
  render: function ProductAdaptersDemo() {
    const [fleet, setFleet] = useState<string | undefined>('pro');
    const [polly, setPolly] = useState<string | undefined>('auto');
    const [robin, setRobin] = useState<string | undefined>('claude-opus-5');
    const [effort, setEffort] = useState<string | undefined>('high');
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState('');
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-space-6">
        <section className="flex flex-col gap-space-3">
          <Text weight="medium">Fleet · Served Tiers</Text>
          <ComposerFrame
            options={[
              { value: 'fast', label: 'Fast' },
              { value: 'pro', label: 'Pro' },
              { value: 'max', label: 'Max' },
            ]}
            value={fleet}
            onChange={setFleet}
            allowDeselect
          />
        </section>
        <section className="flex flex-col gap-space-3">
          <Text weight="medium">Polly · Providers and Hosted Models</Text>
          <ComposerFrame
            aria-label="Polly model"
            options={WORKSPACE_OPTIONS}
            value={polly}
            onChange={setPolly}
            open={open}
            onOpenChange={setOpen}
            allowDeselect
            footer={
              <Button
                variant="plain"
                color="secondary"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setAction('The app opens workspace model settings.');
                }}
              >
                Configure models
              </Button>
            }
          />
          {action && (
            <Text role="status" variant="sm">
              {action}
            </Text>
          )}
        </section>
        <section className="flex flex-col gap-space-3">
          <Text weight="medium">Robin · Model and Reasoning</Text>
          <div className="flex flex-wrap items-center gap-space-2">
            <ChatComposerModelSelect
              options={MODEL_OPTIONS}
              value={robin}
              onChange={setRobin}
              hideSearch={false}
            />
            <Select
              aria-label="Reasoning effort"
              variant="plain"
              value={effort}
              onChange={setEffort}
              options={[
                { value: 'low', label: 'Low effort' },
                { value: 'medium', label: 'Medium effort' },
                { value: 'high', label: 'High effort' },
              ]}
            />
          </div>
          <Text variant="sm" color="tertiary">
            The app owns effort availability and keeps it separate from model
            selection.
          </Text>
        </section>
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Polly model' })
    );
    await userEvent.keyboard('anthropic');
    const listbox = await within(document.body).findByRole('listbox');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(3);
  },
};
