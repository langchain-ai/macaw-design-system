import { fn } from 'storybook/test';

import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { HeartIcon } from '@phosphor-icons/react/dist/ssr/Heart';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ArrowRightIcon,
  CaretDownIcon,
  PlusIcon,
  XIcon,
} from '../../icons/PaddedPhosphorIcons';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/Buttons/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'error'],
    },
    variant: {
      control: { type: 'select' },
      options: ['normal', 'outlined', 'plain'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    round: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    size: {
      control: { type: 'select' },
      options: ['xxs', 'xs', 'sm', 'md'],
    },
    icon: {
      control: { type: 'select' },
      options: [
        'PlusIcon',
        'ArrowRightIcon',
        'CaretDownIcon',
        'XIcon',
        'PencilSimpleIcon',
        'TrashIcon',
        'HeartIcon',
      ],
      mapping: {
        PlusIcon,
        ArrowRightIcon,
        CaretDownIcon,
        XIcon,
        PencilSimpleIcon,
        TrashIcon,
        HeartIcon,
      },
    },
  },
  args: { onClick: fn() },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const PrimaryNormal: Story = {
  args: {
    color: 'primary',
    variant: 'normal',
    icon: PlusIcon,
    label: 'Add',
  },
};

export const SecondaryNormal: Story = {
  args: {
    color: 'secondary',
    variant: 'normal',
    icon: XIcon,
    label: 'Close',
  },
};

export const DisabledPrimary: Story = {
  args: {
    color: 'primary',
    variant: 'outlined',
    icon: PencilSimpleIcon,
    disabled: true,
    label: 'Edit',
  },
};

export const RoundPrimary: Story = {
  args: {
    color: 'primary',
    variant: 'normal',
    round: true,
    icon: PlusIcon,
    label: 'Add',
  },
};

// Comprehensive showcase
export const AllVariants: Story = {
  args: {
    icon: PlusIcon,
    label: 'Add',
  },
  render: () => (
    <div className="space-y-space-6">
      {/* Primary variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Primary Color</h3>
        <div className="flex flex-wrap gap-space-4">
          <IconButton
            color="primary"
            variant="normal"
            icon={PlusIcon}
            label="Add"
          />
          <IconButton
            color="primary"
            variant="outlined"
            icon={PencilSimpleIcon}
            label="Edit"
          />
          <IconButton
            color="primary"
            variant="plain"
            icon={HeartIcon}
            label="Like"
          />
          <IconButton
            color="primary"
            variant="normal"
            round
            icon={ArrowRightIcon}
            label="Next"
          />
        </div>
      </div>

      {/* Secondary variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Secondary Color</h3>
        <div className="flex flex-wrap gap-space-4">
          <IconButton
            color="secondary"
            variant="normal"
            icon={XIcon}
            label="Close"
          />
          <IconButton
            color="secondary"
            variant="outlined"
            icon={TrashIcon}
            label="Delete"
          />
          <IconButton
            color="secondary"
            variant="plain"
            icon={CaretDownIcon}
            label="Down"
          />
          <IconButton
            color="secondary"
            variant="normal"
            round
            icon={DownloadSimpleIcon}
            label="Download"
          />
        </div>
      </div>

      {/* Error variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Error Color</h3>
        <div className="flex flex-wrap gap-space-4">
          <IconButton
            color="error"
            variant="normal"
            icon={XIcon}
            label="Delete"
          />
          <IconButton
            color="error"
            variant="outlined"
            icon={TrashIcon}
            label="Delete"
          />
          <IconButton
            color="error"
            variant="plain"
            icon={TrashIcon}
            label="Delete"
          />
          <IconButton
            color="error"
            variant="normal"
            round
            icon={TrashIcon}
            label="Delete"
          />
        </div>
      </div>

      {/* Round variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Round Variants</h3>
        <div className="flex flex-wrap gap-space-4">
          <IconButton variant="normal" round icon={PlusIcon} label="Add" />
          <IconButton
            variant="outlined"
            round
            icon={PencilSimpleIcon}
            label="Edit"
          />
          <IconButton variant="plain" round icon={HeartIcon} label="Like" />
          <IconButton
            color="secondary"
            variant="normal"
            round
            icon={XIcon}
            label="Close"
          />
        </div>
      </div>

      {/* Sizes variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Size Variants</h3>
        <div className="flex flex-wrap items-center gap-space-4">
          <IconButton
            size="xxs"
            variant="outlined"
            icon={PlusIcon}
            label="Add"
          />
          <IconButton
            size="xs"
            variant="outlined"
            icon={PlusIcon}
            label="Add"
          />
          <IconButton
            size="sm"
            variant="outlined"
            icon={PlusIcon}
            label="Add"
          />
          <IconButton
            size="sm"
            variant="outlined"
            icon={PencilSimpleIcon}
            label="Edit"
          />
          <IconButton
            size="md"
            variant="outlined"
            icon={HeartIcon}
            label="Like"
          />
          <IconButton
            size="md"
            color="secondary"
            variant="normal"
            icon={XIcon}
            round
            label="Close"
          />
        </div>
      </div>

      {/* Different icons */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Different Icons</h3>
        <div className="flex flex-wrap gap-space-4">
          <IconButton icon={PlusIcon} label="Add" />
          <IconButton icon={PencilSimpleIcon} label="Edit" />
          <IconButton icon={TrashIcon} label="Delete" />
          <IconButton icon={HeartIcon} label="Like" />
          <IconButton icon={XIcon} label="Close" />
          <IconButton icon={ArrowRightIcon} label="Next" />
          <IconButton icon={CaretDownIcon} label="Down" />
          <IconButton icon={DownloadSimpleIcon} label="Download" />
        </div>
      </div>

      {/* Disabled states */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Disabled States</h3>
        <div className="flex flex-wrap gap-space-4">
          <IconButton
            disabled
            color="primary"
            variant="normal"
            icon={PlusIcon}
            label="Add"
          />
          <IconButton
            disabled
            color="secondary"
            variant="outlined"
            icon={PencilSimpleIcon}
            label="Edit"
          />
          <IconButton
            disabled
            color="primary"
            variant="plain"
            icon={HeartIcon}
            label="Like"
          />
          <IconButton
            disabled
            color="secondary"
            variant="normal"
            round
            icon={TrashIcon}
            label="Delete"
          />
        </div>
      </div>
    </div>
  ),
};

// Interactive examples
export const InteractiveExample: Story = {
  args: {
    icon: PlusIcon,
    label: 'Add',
  },
  render: () => (
    <div className="space-y-space-4">
      <h3 className="text-lg font-semibold">Interactive Examples</h3>
      <div className="flex flex-wrap gap-space-4">
        <IconButton
          icon={PlusIcon}
          onClick={() => alert('Add clicked!')}
          aria-label="Add item"
          label="Add"
        />
        <IconButton
          color="secondary"
          variant="outlined"
          icon={PencilSimpleIcon}
          onClick={() => alert('Edit clicked!')}
          aria-label="Edit item"
          label="Edit"
        />
        <IconButton
          variant="plain"
          icon={HeartIcon}
          onClick={() => alert('Like clicked!')}
          aria-label="Like item"
          label="Like"
        />
        <IconButton
          color="secondary"
          variant="normal"
          round
          icon={TrashIcon}
          onClick={() => alert('Delete clicked!')}
          aria-label="Delete item"
          label="Delete"
        />
      </div>
    </div>
  ),
};
