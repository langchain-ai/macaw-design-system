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
      options: ['sm', 'md'],
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
      <Button>First</Button>
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
