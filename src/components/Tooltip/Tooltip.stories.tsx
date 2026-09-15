import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';

const meta = {
  title: 'Components/Popovers/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'The title of the tooltip',
    },
    description: {
      control: { type: 'text' },
      description: 'The description text of the tooltip',
    },
    side: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Position of the tooltip relative to the trigger',
    },
    sideOffset: {
      control: { type: 'number', min: 0, max: 50, step: 1 },
      description: 'Distance in pixels from the trigger element',
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
      description: 'Alignment of the tooltip relative to the trigger',
    },
    alignOffset: {
      control: { type: 'number', min: -50, max: 50, step: 1 },
      description: 'Offset in pixels from the aligned position',
    },
    delayDuration: {
      control: { type: 'number', min: 0, max: 2000, step: 50 },
      description: 'Delay in milliseconds before the tooltip appears',
    },
    invert: {
      control: { type: 'boolean' },
      description: 'Whether to invert the tooltip colors',
    },
    tooltipClassName: {
      control: { type: 'text' },
      description: 'Additional CSS classes for the tooltip content',
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-20">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// Tooltip with title and description
export const WithTitleAndDescription: Story = {
  args: {
    title: 'Tooltip Title',
    description:
      'This is a longer description that provides more context about the element.',
    children: <Button>Hover for details</Button>,
  },
};

export const SlowDelay: Story = {
  args: {
    title: 'Slow Tooltip',
    description: 'This tooltip appears slowly (1000ms delay).',
    delayDuration: 1000,
    children: <Button>Slow (1000ms)</Button>,
  },
};

// Inverted tooltip
export const Inverted: Story = {
  args: {
    title: 'Inverted Tooltip',
    description: 'This tooltip has inverted colors.',
    invert: true,
    children: <Button>Inverted</Button>,
  },
};

// Complex content with JSX title
export const WithJSXTitle: Story = {
  args: {
    title: (
      <div className="flex items-center gap-space-2">
        <InfoIcon size={12} weight="bold" />
        <span>Custom Title</span>
      </div>
    ),
    description:
      'You can pass JSX elements as the title for more complex layouts.',
    children: <Button>JSX Title</Button>,
  },
};


// Advanced positioning example
export const AdvancedPositioning: Story = {
  args: {
    title: 'Advanced Positioning',
    description: 'Custom side, alignment, and offsets combined.',
    side: 'right',
    align: 'start',
    sideOffset: 15,
    alignOffset: 10,
    delayDuration: 200,
    children: <Button>Advanced</Button>,
  },
};

// Multiple tooltips demonstration
export const MultipleTooltips: Story = {
  args: {
    title: 'Multiple Tooltips Demo',
    children: <Button>Demo</Button>,
  },
  render: () => (
    <div className="flex gap-space-4">
      <Tooltip title="First Tooltip" description="This is the first tooltip">
        <Button>First</Button>
      </Tooltip>
      <Tooltip
        title="Second Tooltip"
        description="This is the second tooltip"
        side="bottom"
      >
        <Button>Second</Button>
      </Tooltip>
      <Tooltip
        title="Third Tooltip"
        description="This is the third tooltip"
        side="left"
        align="start"
      >
        <Button>Third</Button>
      </Tooltip>
      <Tooltip
        title="Fourth Tooltip"
        description="This is the fourth tooltip"
        side="right"
        sideOffset={20}
        invert
      >
        <Button>Fourth</Button>
      </Tooltip>
    </div>
  ),
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    title: 'Custom Styled Tooltip',
    description: 'This tooltip has custom styling applied.',
    tooltipClassName: 'bg-ls-acid-25 text-ls-acid-700',
    children: <Button>Custom styling</Button>,
  },
};
