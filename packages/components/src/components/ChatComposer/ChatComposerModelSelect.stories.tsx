import { useState } from 'react';

import { expect, fn, within } from 'storybook/test';

import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatComposer,
  ChatComposerAttachmentMenu,
  ChatComposerInput,
  ChatComposerModelSelect,
  ChatComposerToolbar,
} from '.';
import type {
  ChatComposerModelGroup,
  ChatComposerModelOption,
  ChatComposerModelSelectProps,
} from '.';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Select } from '../Select';
import { Text } from '../Text';

function ProviderMark({ letter }: { letter: string }) {
  return (
    <span className="flex size-4 items-center justify-center rounded-sm bg-tertiary text-[10px] font-semibold leading-none text-secondary">
      {letter}
    </span>
  );
}

const anthropic = <ProviderMark letter="A" />;
const openai = <ProviderMark letter="O" />;
const google = <ProviderMark letter="G" />;

const PROVIDER_GROUPS: ChatComposerModelGroup[] = [
  {
    heading: 'Anthropic',
    options: [
      {
        value: 'claude-sonnet-5-5',
        label: 'Sonnet 5.5',
        icon: anthropic,
        badge: (
          <Badge color="special" size="sm">
            Default
          </Badge>
        ),
      },
      { value: 'claude-opus-5', label: 'Opus 5', icon: anthropic },
      { value: 'claude-haiku-5', label: 'Haiku 5', icon: anthropic },
    ],
  },
  {
    heading: 'OpenAI',
    options: [
      { value: 'gpt-6', label: 'GPT-6', icon: openai },
      { value: 'gpt-6-mini', label: 'GPT-6 mini', icon: openai },
    ],
  },
  {
    heading: 'Google',
    options: [
      { value: 'gemini-4-pro', label: 'Gemini 4 Pro', icon: google },
      {
        value: 'gemini-4-flash',
        label: 'Gemini 4 Flash',
        icon: google,
        disabled: true,
        badge: (
          <Badge color="secondary" size="sm" rounded="full">
            Needs API key
          </Badge>
        ),
      },
    ],
  },
];

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
  args: { groups: PROVIDER_GROUPS, onChange: fn() },
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
          'The host controls `value`/`onChange` and supplies options or groups. Macaw shares model rows, search, and focus handling; products own catalogs, permissions, and routing. Provider marks here are placeholders.',
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

function ProvidersDemo() {
  const [model, setModel] = useState<string | undefined>('claude-sonnet-5-5');
  return (
    <ComposerFrame groups={PROVIDER_GROUPS} value={model} onChange={setModel} />
  );
}

/** Concrete models grouped by provider, with provider marks, a badge, and a disabled model. Seven models, so no search. */
export const Providers: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="mx-auto w-full max-w-2xl">
      <ProvidersDemo />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }));
    const listbox = await within(document.body).findByRole('listbox');
    await expect(
      within(listbox).getByRole('option', { name: /Sonnet 5\.5/ })
    ).toHaveAttribute('aria-selected', 'true');
  },
};

const MANY_MODELS: ChatComposerModelGroup[] = [
  ...PROVIDER_GROUPS,
  {
    heading: 'Workspace models',
    options: [
      {
        value: 'support-finetune',
        label: 'support-bot-finetune-2026-10',
        description: 'Fine-tuned GPT-6 mini',
        icon: openai,
      },
      {
        value: 'eval-judge',
        label: 'eval-judge',
        description: 'Sonnet 5.5 with a judge prompt',
        icon: anthropic,
      },
      {
        value: 'self-hosted',
        label: 'Self-hosted Llama 5 70B',
        keywords: ['meta', 'llama'],
      },
    ],
  },
];

function SearchDemo() {
  const [model, setModel] = useState<string | undefined>('gpt-6');
  const [open, setOpen] = useState(false);
  return (
    <ComposerFrame
      open={open}
      onOpenChange={setOpen}
      groups={MANY_MODELS}
      value={model}
      onChange={setModel}
      footer={
        <Button
          size="sm"
          variant="plain"
          color="secondary"
          className="w-full justify-start gap-space-2"
          aria-label="Manage models"
          onClick={() => setOpen(false)}
        >
          <GearSixIcon size={16} weight="regular" aria-hidden />
          Manage models
        </Button>
      }
    />
  );
}

/** Ten models: search appears and matches labels, keywords, and group headings (try “anthropic”). The footer holds a host action. */
export const SearchAndFooter: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="mx-auto w-full max-w-2xl">
      <SearchDemo />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }));
    await userEvent.keyboard('anthropic');
    const listbox = await within(document.body).findByRole('listbox');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(3);
  },
};

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
            groups={PROVIDER_GROUPS}
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
        groups={PROVIDER_GROUPS}
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
    icon: openai,
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

const WORKSPACE_GROUPS: ChatComposerModelGroup[] = [
  ...PROVIDER_GROUPS,
  {
    heading: 'Workspace Models',
    options: WORKSPACE_MODEL_OPTIONS,
  },
  {
    heading: 'LangSmith Hosted',
    options: [
      {
        value: 'auto',
        label: 'Auto',
        icon: <SparkleIcon size={16} weight="regular" />,
        description:
          'Chooses a model for each message · 24 of 100 messages used',
      },
    ],
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
          groups={[
            {
              heading: 'Workspace Models',
              options: [
                {
                  value: 'eval-judge',
                  label: 'Evaluation judge',
                  icon: anthropic,
                },
                ...WORKSPACE_MODEL_OPTIONS,
              ],
            },
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
            groups={WORKSPACE_GROUPS}
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
              groups={PROVIDER_GROUPS}
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
};

/** Server-filtered results may omit the selected model. Its metadata keeps the trigger stable, and search stays available even with zero results. */
export const RemoteSearch: Story = {
  tags: ['a11y-test'],
  render: function RemoteSearchDemo() {
    const [model, setModel] = useState<string | undefined>('gpt-6');
    const [query, setQuery] = useState('');
    const catalog = MANY_MODELS.flatMap((group) => group.options);
    return (
      <div className="mx-auto w-full max-w-2xl">
        <ComposerFrame
          options={catalog.filter((option) =>
            (option.label ?? option.value)
              .toLowerCase()
              .includes(query.toLowerCase())
          )}
          selectedOption={catalog.find((option) => option.value === model)}
          value={model}
          onChange={setModel}
          disableFilter
          onSearchChange={setQuery}
          onOpenChange={(next) => {
            if (!next) setQuery('');
          }}
        />
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }));
    const search = within(document.body).getByPlaceholderText('Search models…');
    await userEvent.type(search, 'no matching model');
    await expect(search).toHaveFocus();
    await expect(
      within(document.body).getByText('No models found.')
    ).toBeVisible();
    await expect(
      canvas.getByRole('combobox', { name: 'Model' })
    ).toHaveTextContent('GPT-6');
  },
};
