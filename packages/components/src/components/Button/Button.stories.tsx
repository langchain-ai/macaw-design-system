import { fn } from 'storybook/test';

import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ArrowRightIcon,
  CaretDownIcon,
  PlusIcon,
} from '../../icons/PaddedPhosphorIcons';
import { Button } from './Button';

const meta = {
  title: 'Components/Buttons/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Triggers an immediate action. Use Link for navigation and IconButton for icon-only actions.',
      },
    },
  },
  tags: ['autodocs', 'action', 'submit', 'click', 'cta'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'error'],
    },
    variant: {
      control: { type: 'select' },
      options: ['normal', 'outlined', 'plain', 'underlined'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    tagText: {
      control: { type: 'text' },
    },
    tagPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    leftDecorator: {
      control: { type: 'select' },
      options: ['None', 'PlusIcon', 'ArrowRightIcon', 'CaretDownIcon'],
      mapping: {
        None: undefined,
        PlusIcon,
        ArrowRightIcon,
        CaretDownIcon,
      },
    },
    rightDecorator: {
      control: { type: 'select' },
      options: ['None', 'PlusIcon', 'ArrowRightIcon', 'CaretDownIcon'],
      mapping: {
        None: undefined,
        PlusIcon,
        ArrowRightIcon,
        CaretDownIcon,
      },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Size variants
export const ExtraSmallSize: Story = {
  args: {
    size: 'xs',
    children: 'Extra Small Button',
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const MediumSize: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

// Basic variants
export const PrimaryNormal: Story = {
  args: {
    color: 'primary',
    variant: 'normal',
    children: 'Primary Button',
  },
};

export const PrimaryOutlined: Story = {
  args: {
    color: 'primary',
    variant: 'outlined',
    children: 'Primary Outlined',
  },
};

export const PrimaryPlain: Story = {
  args: {
    color: 'primary',
    variant: 'plain',
    children: 'Primary Plain',
  },
};

export const PrimaryUnderlined: Story = {
  args: {
    color: 'primary',
    variant: 'underlined',
    children: 'Primary Underlined',
  },
};

export const SecondaryNormal: Story = {
  args: {
    color: 'secondary',
    variant: 'normal',
    children: 'Secondary Button',
  },
};

export const SecondaryOutlined: Story = {
  args: {
    color: 'secondary',
    variant: 'outlined',
    children: 'Secondary Outlined',
  },
};

export const SecondaryPlain: Story = {
  args: {
    color: 'secondary',
    variant: 'plain',
    children: 'Secondary Plain',
  },
};

export const SecondaryUnderlined: Story = {
  args: {
    color: 'secondary',
    variant: 'underlined',
    children: 'Secondary Underlined',
  },
};

export const ErrorNormal: Story = {
  args: {
    color: 'error',
    variant: 'normal',
    children: 'Error Button',
  },
};

export const ErrorOutlined: Story = {
  args: {
    color: 'error',
    variant: 'outlined',
    children: 'Error Button',
  },
};

export const ErrorPlain: Story = {
  args: {
    color: 'error',
    variant: 'plain',
    children: 'Error Button',
  },
};

// With decorators
export const WithLeftDecorator: Story = {
  args: {
    leftDecorator: PlusIcon,
    children: 'Add Item',
  },
};

export const WithRightDecorator: Story = {
  args: {
    rightDecorator: ArrowRightIcon,
    children: 'Continue',
  },
};

export const WithBothDecorators: Story = {
  args: {
    leftDecorator: DownloadSimpleIcon,
    rightDecorator: ArrowRightIcon,
    children: 'Download',
  },
};

// With tags
export const WithRightTag: Story = {
  args: {
    children: 'Button',
    tagText: 'New',
    tagPosition: 'right',
  },
};

export const WithLeftTag: Story = {
  args: {
    children: 'Button',
    tagText: 'Beta',
    tagPosition: 'left',
  },
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const DisabledWithDecorators: Story = {
  args: {
    disabled: true,
    leftDecorator: PlusIcon,
    rightDecorator: ArrowRightIcon,
    children: 'Disabled with Icons',
  },
};

// Comprehensive showcase
export const AllVariants: Story = {
  args: {
    children: 'Button',
  },
  render: () => (
    <div className="space-y-space-6">
      {/* Size variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Size Variants</h3>
        <div className="flex flex-wrap items-center gap-space-4">
          <Button size="xs">Extra Small Button</Button>
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
        </div>
        <div className="flex flex-wrap items-center gap-space-4">
          <Button size="xs" leftDecorator={PlusIcon}>
            Extra Small with Icon
          </Button>
          <Button size="sm" leftDecorator={PlusIcon}>
            Small with Icon
          </Button>
          <Button size="md" leftDecorator={PlusIcon}>
            Medium with Icon
          </Button>
        </div>
      </div>

      {/* Primary variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Primary Color</h3>
        <div className="flex flex-wrap gap-space-4">
          <Button color="primary" variant="normal">
            Normal
          </Button>
          <Button color="primary" variant="outlined">
            Outlined
          </Button>
          <Button color="primary" variant="plain">
            Plain
          </Button>
          <Button color="primary" variant="underlined">
            Underlined
          </Button>
        </div>
      </div>

      {/* Secondary variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Secondary Color</h3>
        <div className="flex flex-wrap gap-space-4">
          <Button color="secondary" variant="normal">
            Normal
          </Button>
          <Button color="secondary" variant="outlined">
            Outlined
          </Button>
          <Button color="secondary" variant="plain">
            Plain
          </Button>
          <Button color="secondary" variant="underlined">
            Underlined
          </Button>
        </div>
      </div>

      {/* Error variants */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Error Color</h3>
        <div className="flex flex-wrap gap-space-4">
          <Button color="error" variant="normal">
            Normal
          </Button>
          <Button color="error" variant="outlined">
            Outlined
          </Button>
          <Button color="error" variant="plain">
            Plain
          </Button>
          <Button color="error" variant="underlined">
            Underlined
          </Button>
        </div>
      </div>

      {/* With decorators */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">With Decorators</h3>
        <div className="flex flex-wrap gap-space-4">
          <Button leftDecorator={PlusIcon}>Add</Button>
          <Button rightDecorator={ArrowRightIcon}>Continue</Button>
          <Button
            leftDecorator={DownloadSimpleIcon}
            rightDecorator={ArrowRightIcon}
          >
            Download
          </Button>
        </div>
      </div>

      {/* With tags */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">With Tags</h3>
        <div className="flex flex-wrap gap-space-4">
          <Button tagText="New">Button with Right Tag</Button>
          <Button tagText="Beta" tagPosition="left">
            Button with Left Tag
          </Button>
        </div>
      </div>

      {/* Disabled states */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Disabled States</h3>
        <div className="flex flex-wrap gap-space-4">
          <Button disabled color="primary" variant="normal">
            Disabled Primary Normal
          </Button>
          <Button disabled color="primary" variant="plain">
            Disabled Primary Plain
          </Button>
          <Button disabled color="primary" variant="underlined">
            Disabled Primary Underlined
          </Button>
          <Button disabled color="secondary" variant="normal">
            Disabled Secondary
          </Button>
          <Button disabled color="secondary" variant="underlined">
            Disabled Secondary Underlined
          </Button>
          <Button disabled leftDecorator={PlusIcon}>
            Disabled with Icon
          </Button>
          <Button disabled tagText="New">
            Disabled with Tag
          </Button>
        </div>
      </div>
    </div>
  ),
};

// Interactive examples
export const InteractiveExample: Story = {
  args: {
    children: 'Button',
  },
  render: () => (
    <div className="space-y-space-4">
      <h3 className="text-lg font-semibold">Interactive Examples</h3>
      <div className="flex flex-wrap gap-space-4">
        <Button leftDecorator={PlusIcon} onClick={() => alert('Add clicked!')}>
          Add Item
        </Button>
        <Button
          color="secondary"
          variant="outlined"
          rightDecorator={ArrowRightIcon}
          tagText="Pro"
          onClick={() => alert('Continue clicked!')}
        >
          Continue
        </Button>
        <Button
          variant="underlined"
          onClick={() => alert('Learn more clicked!')}
        >
          Learn More
        </Button>
      </div>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading Button',
  },
};
