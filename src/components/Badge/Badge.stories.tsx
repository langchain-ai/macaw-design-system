import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { LinkIcon } from '@phosphor-icons/react/dist/ssr/Link';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '.';
import { CaretDownIcon, PlusIcon } from '../../icons/PaddedPhosphorIcons';

const meta: Meta<typeof Badge> = {
  title: 'Components/Display/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'manifestPreview'],
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'success',
        'error',
        'warning',
        'special',
        'plain',
      ],
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 'sm', 'md'],
    },
    rounded: {
      control: 'select',
      options: ['full', 'none', 'xs', 'sm'],
    },
    leftDecorator: {
      control: 'select',
      options: ['None', 'PlusIcon', 'CheckCircleIcon'],
      mapping: {
        None: undefined,
        PlusIcon,
        CheckCircleIcon,
      },
    },
    rightDecorator: {
      control: 'select',
      options: ['None', 'CaretDownIcon', 'InfoIcon'],
      mapping: {
        None: undefined,
        CaretDownIcon,
        InfoIcon,
      },
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const WithDecorators: Story = {
  args: {
    children: 'With Icon',
    color: 'success',
    leftDecorator: PlusIcon,
    rightDecorator: CaretDownIcon,
    iconWeight: 'regular',
  },
};

export const WithSvgOnly: Story = {
  render: () => (
    <Badge color="primary">
      <LinkIcon size={12} weight="regular" />
    </Badge>
  ),
};

export const Rounded: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <Badge size="md" rounded="none">
        None
      </Badge>
      <Badge size="md" color="success" rounded="xs">
        XS
      </Badge>
      <Badge size="md" color="success" rounded="sm">
        SM
      </Badge>
      <Badge
        size="md"
        leftDecorator={CheckCircleIcon}
        iconWeight="regular"
        color="primary"
        rounded="full"
      >
        Full
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <div className="flex flex-col items-center gap-space-2">
        <Badge size="xxs">Extra Extra Small</Badge>
        <Badge
          size="xxs"
          leftDecorator={CheckCircleIcon}
          iconWeight="regular"
          color="primary"
        >
          Icon
        </Badge>
        <Badge size="xxs" rounded="xs" color="success">
          Less rounded
        </Badge>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Badge size="xs">Extra Small</Badge>
        <Badge
          size="xs"
          leftDecorator={CheckCircleIcon}
          iconWeight="regular"
          color="primary"
        >
          Icon
        </Badge>
        <Badge size="xs" rounded="xs" color="success">
          Less rounded
        </Badge>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Badge size="sm">Small</Badge>
        <Badge
          size="sm"
          leftDecorator={CheckCircleIcon}
          iconWeight="regular"
          color="primary"
        >
          Icon
        </Badge>
        <Badge size="sm" rounded="xs" color="success">
          Less rounded
        </Badge>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Badge size="md">Medium</Badge>
        <Badge
          size="md"
          leftDecorator={CheckCircleIcon}
          iconWeight="regular"
          color="primary"
        >
          Icon
        </Badge>
        <Badge size="md" rounded="xs" color="success">
          Less rounded
        </Badge>
      </div>
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-space-2">
      <Badge color="secondary">Secondary</Badge>
      <Badge color="primary">Primary</Badge>
      <Badge color="success">Success</Badge>
      <Badge color="error">Error</Badge>
      <Badge color="warning">Warning</Badge>
      <Badge color="special">Special</Badge>
      <Badge color="plain">plain</Badge>
      <Badge
        color="success"
        leftDecorator={CheckCircleIcon}
        iconWeight="regular"
      >
        Success w/ Icon
      </Badge>
    </div>
  ),
};
