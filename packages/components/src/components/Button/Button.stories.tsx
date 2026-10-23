import { Fragment } from 'react';

import { fn } from 'storybook/test';

import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ArrowRightIcon,
  CaretDownIcon,
  PlusIcon,
} from '../../icons/PaddedPhosphorIcons';
import { IconButton } from '../IconButton';
import { Button } from './Button';
import { buttonStyleMap } from './constants';

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

// Exhaustive combinations grid
const BUTTON_SIZES = ['xs', 'sm', 'md'] as const;
const BUTTON_COLORS = ['primary', 'secondary', 'error'] as const;
const BUTTON_VARIANTS = ['normal', 'outlined', 'plain', 'underlined'] as const;
const ICON_BUTTON_VARIANTS = ['normal', 'outlined', 'plain'] as const;
const ICON_BUTTON_SIZES = ['xxs', 'xs', 'sm', 'md'] as const;

const STATE_COLUMNS = [
  'Default',
  'Hover',
  'Pressed',
  'Disabled',
  'Loading',
  'Left Decorator',
  'Right Decorator',
  'Both Decorators',
  'Left Tag',
  'Right Tag',
  'Disabled + Decorators',
] as const;

// Strip the `hover:` / `dark:hover:` variant prefix so hover styles apply
// unconditionally — tailwind-merge dedupes the resulting classes against the
// base styles, so the hover look wins. Used to statically visualize the
// hover state in the grid without a pseudo-states addon.
const forceHoverClassName = (
  color: (typeof BUTTON_COLORS)[number],
  variant: (typeof BUTTON_VARIANTS)[number]
) => {
  const key =
    `${color}-${variant}-enabled` as keyof typeof buttonStyleMap;
  return (buttonStyleMap[key] ?? '')
    .split(/\s+/)
    .filter((c) => c.startsWith('hover:') || c.startsWith('dark:hover:'))
    .map((c) => c.replace(/^hover:/, '').replace(/^dark:hover:/, 'dark:'))
    .join(' ');
};

const forceIconHoverClassName = (
  color: (typeof BUTTON_COLORS)[number],
  variant: (typeof ICON_BUTTON_VARIANTS)[number]
) =>
  forceHoverClassName(
    color,
    variant as (typeof BUTTON_VARIANTS)[number]
  );

// Approximation of the browser's native pressed look: layered on top of the
// forced-hover classes since a real press always happens while hovering. The
// Button component itself does not define `active:` styles, so this is a
// visual indicator rather than a design-system token.
const PRESSED_INDICATOR = 'scale-[0.97] brightness-95';

export const AllCombinations: Story = {
  args: {
    children: 'Button',
  },
  decorators: [
    (StoryFn) => (
      <TooltipProvider>
        <StoryFn />
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className="space-y-space-8">
      {BUTTON_SIZES.map((size) => (
        <section key={size} className="space-y-space-4">
          <h2 className="text-xl font-semibold">Size: {size}</h2>
          {BUTTON_COLORS.map((color) => (
            <div key={`${size}-${color}`} className="space-y-space-2">
              <h3 className="text-base font-medium capitalize">{color}</h3>
              <div
                className="grid gap-space-3 items-center"
                style={{
                  gridTemplateColumns: `max-content repeat(${STATE_COLUMNS.length}, max-content)`,
                }}
              >
                <div />
                {STATE_COLUMNS.map((header) => (
                  <div
                    key={header}
                    className="text-xxs font-medium text-text-tertiary"
                  >
                    {header}
                  </div>
                ))}
                {BUTTON_VARIANTS.map((variant) => (
                  <Fragment key={`${size}-${color}-${variant}`}>
                    <div className="text-xxs font-medium text-text-tertiary capitalize">
                      {variant}
                    </div>
                    <Button size={size} color={color} variant={variant}>
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      className={forceHoverClassName(color, variant)}
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      className={`${forceHoverClassName(color, variant)} ${PRESSED_INDICATOR}`}
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      disabled
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      loading
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      leftDecorator={PlusIcon}
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      rightDecorator={ArrowRightIcon}
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      leftDecorator={DownloadSimpleIcon}
                      rightDecorator={ArrowRightIcon}
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      tagText="Beta"
                      tagPosition="left"
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      tagText="New"
                      tagPosition="right"
                    >
                      Button
                    </Button>
                    <Button
                      size={size}
                      color={color}
                      variant={variant}
                      disabled
                      leftDecorator={PlusIcon}
                      rightDecorator={ArrowRightIcon}
                    >
                      Button
                    </Button>
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <section className="space-y-space-4">
        <h2 className="text-xl font-semibold">Icon Only (IconButton)</h2>
        {ICON_BUTTON_SIZES.map((size) => (
          <div key={`icon-${size}`} className="space-y-space-2">
            <h3 className="text-base font-medium">Size: {size}</h3>
            {BUTTON_COLORS.map((color) => (
              <div key={`icon-${size}-${color}`} className="space-y-space-2">
                <h4 className="text-sm font-medium capitalize text-text-secondary">
                  {color}
                </h4>
                <div
                  className="grid gap-space-3 items-center"
                  style={{
                    gridTemplateColumns:
                      'max-content repeat(7, max-content)',
                  }}
                >
                  <div />
                  <div className="text-xxs font-medium text-text-tertiary">
                    Default
                  </div>
                  <div className="text-xxs font-medium text-text-tertiary">
                    Hover
                  </div>
                  <div className="text-xxs font-medium text-text-tertiary">
                    Pressed
                  </div>
                  <div className="text-xxs font-medium text-text-tertiary">
                    Disabled
                  </div>
                  <div className="text-xxs font-medium text-text-tertiary">
                    Loading
                  </div>
                  <div className="text-xxs font-medium text-text-tertiary">
                    Round
                  </div>
                  <div className="text-xxs font-medium text-text-tertiary">
                    Round + Disabled
                  </div>
                  {ICON_BUTTON_VARIANTS.map((variant) => (
                    <Fragment key={`icon-${size}-${color}-${variant}`}>
                      <div className="text-xxs font-medium text-text-tertiary capitalize">
                        {variant}
                      </div>
                      <IconButton
                        size={size}
                        color={color}
                        variant={variant}
                        icon={PlusIcon}
                        label="Add"
                      />
                      <IconButton
                        size={size}
                        color={color}
                        variant={variant}
                        icon={PlusIcon}
                        label="Add"
                        className={forceIconHoverClassName(color, variant)}
                      />
                      <IconButton
                        size={size}
                        color={color}
                        variant={variant}
                        icon={PlusIcon}
                        label="Add"
                        className={`${forceIconHoverClassName(color, variant)} ${PRESSED_INDICATOR}`}
                      />
                      <IconButton
                        size={size}
                        color={color}
                        variant={variant}
                        icon={PlusIcon}
                        label="Add"
                        disabled
                      />
                      <IconButton
                        size={size}
                        color={color}
                        variant={variant}
                        icon={PlusIcon}
                        label="Add"
                        loading
                      />
                      <IconButton
                        size={size}
                        color={color}
                        variant={variant}
                        icon={CaretDownIcon}
                        label="Expand"
                        round
                      />
                      <IconButton
                        size={size}
                        color={color}
                        variant={variant}
                        icon={CaretDownIcon}
                        label="Expand"
                        round
                        disabled
                      />
                    </Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
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
