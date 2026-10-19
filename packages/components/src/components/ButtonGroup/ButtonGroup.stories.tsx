import { GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, ButtonGroup, IconButton } from '..';
import { CaretDownIcon, PlusIcon } from '../../icons/PaddedPhosphorIcons';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/Buttons/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Joins equally sized Button and IconButton controls. Wrappers must not add a DOM container between the group and its controls.',
          '- Group size, color, and variant replace direct-child props, including when undefined.',
          '- PopoverTrigger and DropdownMenuTrigger with asChild forward group props; explicit inner props take precedence.',
          '- Tooltip does not forward group props. Set matching size, color, and variant on its inner control.',
        ].join('\n\n'),
      },
    },
  },
  tags: ['autodocs', 'actions', 'toolbar', 'grouped', 'controls'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    variant: {
      control: 'select',
      options: ['normal', 'outlined', 'plain'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: 'primary',
    variant: 'normal',
    size: 'sm',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button loading>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonGroup>
  ),
};

export const Outlined: Story = {
  args: {
    color: 'primary',
    variant: 'outlined',
    size: 'sm',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonGroup>
  ),
};

export const WithIconButtons: Story = {
  args: {
    color: 'primary',
    variant: 'outlined',
    size: 'sm',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button leftDecorator={PlusIcon}>Add</Button>
      <IconButton icon={GearIcon} label="Settings" />
      <IconButton icon={CaretDownIcon} label="More options" />
    </ButtonGroup>
  ),
};

export const MixedButtons: Story = {
  args: {
    color: 'secondary',
    variant: 'normal',
    size: 'md',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Save</Button>
      <IconButton icon={CaretDownIcon} label="More save options" />
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-space-3">
      <ButtonGroup size="xs" color="secondary" variant="outlined">
        <Button>Extra small</Button>
        <IconButton icon={CaretDownIcon} label="Extra small options" />
      </ButtonGroup>
      <ButtonGroup size="sm" color="secondary" variant="outlined">
        <Button>Small</Button>
        <IconButton icon={CaretDownIcon} label="Small options" />
      </ButtonGroup>
      <ButtonGroup size="md" color="secondary" variant="outlined">
        <Button>Medium</Button>
        <IconButton icon={CaretDownIcon} label="Medium options" />
      </ButtonGroup>
    </div>
  ),
};
