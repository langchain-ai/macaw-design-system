import { useState } from 'react';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pane, TopBarPaneSlot } from '.';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Text } from '../Text/Text';

const meta = {
  title: 'Components/Layout/Pane',
  component: Pane,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Right-side modal drawer for focused CRUD flows that overlay the current page, with a dimming overlay by default. Keep `title` to heading text and use `TopBarPaneSlot.Fill` for header actions.',
          '',
          '**vs. Dialog:** Use dialog instead for short, centered confirmations or less complex info.',
          '',
          '**vs. SplitViewPane:** Use SplitViewPane instead when you need an inline, resizable, non-modal side panel without the dimmed overlay.',
          '',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
  // Stories drive state via `render`; these satisfy Pane's required props.
  args: {
    open: false,
    animation: true,
    onClose: () => {},
    title: '',
    children: null,
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Pane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open pane</Button>
        <Pane open={open} onClose={() => setOpen(false)} title="Create sandbox">
          <TopBarPaneSlot.Fill>
            <div className="flex gap-space-2">
              <Button
                color="secondary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Save
              </Button>
            </div>
          </TopBarPaneSlot.Fill>
          <div className="flex flex-col gap-space-4">
            <Input
              label="Name"
              placeholder="Enter a name..."
              onChange={() => {}}
            />
            <Input
              label="Description"
              placeholder="Enter a description..."
              onChange={() => {}}
            />
          </div>
        </Pane>
      </>
    );
  },
};

export const Animated: Story = {
  render: () => {
    const [animatedOpen, setAnimatedOpen] = useState(false);
    const [nonAnimatedOpen, setNonAnimatedOpen] = useState(false);
    return (
      <>
        <div className="flex gap-space-2">
          <Button onClick={() => setAnimatedOpen(true)}>
            Open animated pane
          </Button>
          <Button color="secondary" onClick={() => setNonAnimatedOpen(true)}>
            Open non-animated pane
          </Button>
        </div>
        <Pane
          open={animatedOpen}
          onClose={() => setAnimatedOpen(false)}
          title="Animated pane"
        >
          <Text color="secondary">
            This pane uses the default animated behavior.
          </Text>
        </Pane>
        <Pane
          open={nonAnimatedOpen}
          animation={false}
          onClose={() => setNonAnimatedOpen(false)}
          title="Non-animated pane"
        >
          <Text color="secondary">
            This pane opens and closes without animation.
          </Text>
        </Pane>
      </>
    );
  },
};

export const RequireConfirmationOnClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open pane (guarded close)</Button>
        <Pane
          open={open}
          onClose={() => setOpen(false)}
          title="Edit dataset"
          requireConfirmationOnClose
        >
          <Text color="secondary">
            Try to close this pane — you will be asked to confirm before your
            changes are discarded.
          </Text>
        </Pane>
      </>
    );
  },
};
