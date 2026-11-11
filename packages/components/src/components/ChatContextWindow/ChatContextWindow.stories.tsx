import { useState } from 'react';

import { expect, userEvent, within } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChatContextWindow } from '.';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from '../ChatComposer';

const meta = {
  title: 'Components/Chat/ChatContextWindow',
  component: ChatContextWindow,
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'context',
    'window',
    'tokens',
    'usage',
    'capacity',
    'model',
    'cost',
    'tooltip',
  ],
  args: {
    tokensUsed: 65_800,
    contextWindow: 200_000,
    model: 'Example model',
    totalCost: '$0.25',
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compact context-usage ring with details on hover, keyboard focus, or tap. Import from `@langchain/macaw-components/ChatContextWindow` and place beside `ChatComposerAction` in the toolbar actions slot. The host supplies usage, model capacity, and formatted cost. At 80% the indicator warns; at 100% it reports a full window. Unknown limits use an empty, non-animated ring rather than a guessed percentage. Requires the shared `TooltipProvider`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-80 items-end justify-end p-space-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatContextWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(
      canvas.getByRole('button', { name: /Context window:/ })
    );
    await expect(
      within(document.body).findByRole('tooltip')
    ).resolves.toHaveTextContent('33% used');
  },
};
export const NearlyFull: Story = { args: { tokensUsed: 174_000 } };
export const Full: Story = { args: { tokensUsed: 200_000 } };
export const OverCapacity: Story = { args: { tokensUsed: 216_000 } };
export const UnknownLimit: Story = { args: { contextWindow: null } };
export const Unavailable: Story = {
  args: { tokensUsed: null, contextWindow: null },
};
export const Empty: Story = { args: { tokensUsed: 0, totalCost: '$0.00' } };
export const Disabled: Story = { args: { disabled: true } };
export const LongModelName: Story = {
  args: {
    model:
      'organization/custom-model-with-an-unusually-long-version-name-2026-11-11',
  },
};

function ComposerExample({ narrow = false }: { narrow?: boolean }) {
  const [value, setValue] = useState('');
  return (
    <div className={narrow ? 'w-60' : 'w-96 max-w-full'}>
      <ChatComposer action="stop" onStop={() => {}} aria-label="Chat composer">
        <ChatComposerTextarea
          value={value}
          onChange={setValue}
          placeholder="Ask a follow-up…"
        />
        <ChatComposerToolbar
          actions={
            <>
              <ChatContextWindow
                tokensUsed={65_800}
                contextWindow={200_000}
                model="Example model"
                totalCost="$0.25"
              />
              <ChatComposerAction />
            </>
          }
        />
      </ChatComposer>
    </div>
  );
}

export const InComposer: Story = { render: () => <ComposerExample /> };
export const Narrow: Story = { render: () => <ComposerExample narrow /> };
