import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

const meta = {
  title: 'Components/Popovers/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'A floating panel anchored to a trigger that opens on click for interactive content (forms, menus, filters), built on `@radix-ui/react-popover`. Dismissable via click-outside or Esc, and keyboard-accessible.',
          '',
          '**vs. HoverCard:** HoverCard opens on hover for non-essential preview content. Use Popover when the user must click to open something they interact with. Both share the same surface styling.',
          '',
          '**vs. Dialog:** Dialog is a focus-trapping modal for blocking tasks. Popover is non-modal and anchored to its trigger.',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs', 'floating', 'content', 'anchored', 'overlay'],
  decorators: [
    (Story) => (
      <div className="p-20">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outlined" color="secondary" size="sm">
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="gap-space-2 flex flex-col">
          <Text variant="sm" weight="semibold">
            Popover Title
          </Text>
          <Text variant="sm">
            This is a basic popover with some content inside.
          </Text>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outlined" color="secondary" size="sm">
          Edit settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="gap-space-3 flex flex-col">
          <Text variant="sm" weight="semibold">
            Settings
          </Text>
          <div className="gap-space-1 flex flex-col">
            <Text variant="xs" className="text-secondary">
              Name
            </Text>
            {/* eslint-disable-next-line react/forbid-elements */}
            <input
              className="border-secondary focus:border-brand rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none"
              placeholder="Enter name..."
            />
          </div>
          <div className="gap-space-1 flex flex-col">
            <Text variant="xs" className="text-secondary">
              Description
            </Text>
            {/* eslint-disable-next-line react/forbid-elements */}
            <input
              className="border-secondary focus:border-brand rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none"
              placeholder="Enter description..."
            />
          </div>
          <Button size="sm">Save</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const CustomWidth: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outlined" color="secondary" size="sm">
          Wide popover
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <Text variant="sm">
          This popover has a custom width of w-96 (24rem). The default is w-72
          (18rem). You can customize the width by passing a className to
          PopoverContent.
        </Text>
      </PopoverContent>
    </Popover>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className="gap-space-6 flex">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outlined" color="secondary" size="sm">
            Align start
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Text variant="sm">Aligned to start</Text>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outlined" color="secondary" size="sm">
            Align center
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <Text variant="sm">Aligned to center</Text>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outlined" color="secondary" size="sm">
            Align end
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <Text variant="sm">Aligned to end</Text>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
