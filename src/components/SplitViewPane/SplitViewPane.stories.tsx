import { useState } from 'react';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { HeaderTitleActionSlot, SplitViewPane } from '.';
import { Button } from '../Button';
import { Text } from '../Text';

const meta = {
  title: 'Components/Layout/SplitViewPane',
  component: SplitViewPane,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'Use SplitViewPane to inspect an item in detail while the underlying list, table, or page remains visible and interactive. It is a portaled, resizable, non-modal surface with previous/next navigation.',
          '',
          '**vs. Pane:** Use Pane for interruptive, detailed CRUD flows that require the user’s full attention.',
          '',
          '**vs. Dialog:** Use Dialog for short, centered modal tasks.',
          '',
          'Keep `title` to heading text. Place controls in `HeaderTitleActionSlot.Fill` so they remain outside the semantic heading.',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs', 'resizable', 'split', 'side panels', 'layout'],
  args: {
    open: false,
    children: null,
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof SplitViewPane>;

export default meta;

const runs = [
  { name: 'ChatOpenAI', status: 'Succeeded', latency: '1.42 s' },
  { name: 'Retrieve context', status: 'Succeeded', latency: '284 ms' },
  { name: 'Generate response', status: 'Succeeded', latency: '976 ms' },
];

export const RunDetails: StoryObj<typeof SplitViewPane> = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedRun = runs[selectedIndex];
    const handleNext =
      selectedIndex < runs.length - 1
        ? () => setSelectedIndex((index) => index + 1)
        : undefined;
    const handlePrevious =
      selectedIndex > 0
        ? () => setSelectedIndex((index) => index - 1)
        : undefined;

    return (
      <div className="min-h-screen bg-surface-level-2 p-space-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-space-3">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="h2">Runs</Text>
              <Text variant="sm" color="secondary">
                Select a run to inspect its details without leaving the list.
              </Text>
            </div>
            <Button size="sm" onClick={() => setOpen(true)}>
              Open run details
            </Button>
          </div>

          <div className="rounded-lg border border-subtle bg-surface-level-1">
            {runs.map((run, index) => (
              <Button
                key={run.name}
                variant="plain"
                color="secondary"
                aria-label={`Open ${run.name} details`}
                className="w-full justify-between rounded-none border-0 border-b border-subtle px-space-4 py-space-3 text-left first:rounded-t-lg last:rounded-b-lg last:border-b-0"
                onClick={() => {
                  setSelectedIndex(index);
                  setOpen(true);
                }}
              >
                <Text variant="sm" weight="medium">
                  {run.name}
                </Text>
                <Text variant="sm" color="secondary">
                  {run.latency}
                </Text>
              </Button>
            ))}
          </div>
        </div>

        <SplitViewPane
          open={open}
          onClose={() => setOpen(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          title="Run details"
          defaultWidthPx={720}
        >
          <HeaderTitleActionSlot.Fill>
            <Button size="sm" color="secondary" onClick={() => setOpen(false)}>
              Open full run
            </Button>
          </HeaderTitleActionSlot.Fill>
          <div className="flex flex-col gap-space-5 p-space-5">
            <div className="flex flex-col gap-space-1">
              <Text variant="h2">{selectedRun?.name}</Text>
              <Text variant="sm" color="secondary">
                {selectedRun?.status} · {selectedRun?.latency}
              </Text>
            </div>
          </div>
        </SplitViewPane>
      </div>
    );
  },
};
