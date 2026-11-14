import { useState } from 'react';

import { expect, within } from 'storybook/test';

import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { LightningIcon } from '@phosphor-icons/react/dist/ssr/Lightning';
import { ScalesIcon } from '@phosphor-icons/react/dist/ssr/Scales';
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
    icon: <SparkleIcon size={16} weight="regular" />,
  },
  {
    value: 'fast',
    label: 'Fast model',
    description: 'Quick answers and small edits',
    icon: <LightningIcon size={16} weight="regular" />,
  },
  {
    value: 'balanced',
    label: 'Balanced model',
    description: 'For everyday tasks',
    icon: <ScalesIcon size={16} weight="regular" />,
  },
];

const TIER_OPTIONS_TEXT_ONLY: ChatComposerModelOption[] = TIER_OPTIONS.map(
  ({ icon: _icon, ...option }) => option
);

const meta = {
  title: 'Components/Chat/ChatComposerModelSelect',
  component: ChatComposerModelSelect,
  args: { groups: PROVIDER_GROUPS },
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
          'A borderless model picker for the composer toolbar. Import it from `@langchain/macaw-components/ChatComposer` and pass it to `ChatComposerToolbar`’s `modelSelector`.',
          'Options take a provider `icon`, a `description`, a `badge`, and `disabled`. Use `groups` to group models by provider or tier; searching for a group heading finds its models. Search appears once there are eight or more models; set `hideSearch` to choose.',
          'Control the selection with `value`/`onChange`, or pass `defaultValue` to let the component keep it. `open`/`onOpenChange` open the menu from a shortcut, and `footer` holds actions such as managing models.',
          'Inside `ChatComposer` it follows the composer’s `disabled` state, shows only the icon or a “Model” label in a narrow composer, and moves focus to the message after a choice. It also works outside a composer.',
          'Provider marks here are placeholders; hosts pass their own logos.',
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
  const [model, setModel] = useState('claude-sonnet-5-5');
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

function TiersDemo() {
  const [tier, setTier] = useState('balanced');
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-space-6">
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          Text only
        </Text>
        <ComposerFrame
          options={TIER_OPTIONS_TEXT_ONLY}
          value={tier}
          onChange={setTier}
        />
      </div>
      <div className="flex flex-col gap-space-3">
        <Text variant="sm" weight="medium">
          With tier icons
        </Text>
        <ComposerFrame options={TIER_OPTIONS} value={tier} onChange={setTier} />
      </div>
    </div>
  );
}

/** Tier aliases such as “Balanced model” instead of concrete model names, with descriptions. */
export const Tiers: Story = {
  tags: ['a11y-test'],
  render: () => <TiersDemo />,
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
  const [model, setModel] = useState('gpt-6');
  return (
    <ComposerFrame
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

/** In a narrow composer the trigger shows only the provider mark, or “Model” when there is no mark. */
export const Narrow: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="flex flex-col gap-space-6">
      <div className="w-72">
        <ComposerFrame groups={PROVIDER_GROUPS} defaultValue="gpt-6" />
      </div>
      <div className="w-72">
        <ComposerFrame options={TIER_OPTIONS_TEXT_ONLY} defaultValue="auto" />
      </div>
    </div>
  ),
};

/** A disabled composer disables the picker too. */
export const Disabled: Story = {
  tags: ['a11y-test'],
  render: () => (
    <div className="mx-auto w-full max-w-2xl">
      <ComposerFrame
        disabled
        groups={PROVIDER_GROUPS}
        defaultValue="claude-sonnet-5-5"
      />
    </div>
  ),
};

/** Outside a composer, such as next to a custom input. Uncontrolled with `defaultValue`. */
export const Standalone: Story = {
  args: { defaultValue: 'claude-opus-5', side: 'bottom' },
};
