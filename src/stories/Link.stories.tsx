import { Link as RouterLink, MemoryRouter } from 'react-router-dom';

import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowUpRight';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import type { Meta, StoryObj } from '@storybook/react-vite';

import type { IconComponent } from '../components/Icon';
import { Link } from '../components/Link';
import { Text } from '../components/Text';
import type { TextProps } from '../components/Text';
import type { IconWeight } from '../utils/icon-types';

type LinkStoryArgs = {
  href?: string;
  target?: string;
  rel?: string;
  variant?: TextProps['variant'];
  leftDecorator?: IconComponent;
  rightDecorator?: IconComponent;
  iconWeight?: IconWeight;
  children?: React.ReactNode;
  className?: string;
};

const meta: Meta<LinkStoryArgs> = {
  title: 'Components/Buttons/Link',
  component: Link as React.ComponentType<LinkStoryArgs>,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'md', 'sm', 'xs', 'body'],
    },
    leftDecorator: {
      control: 'select',
      options: ['None', 'ArrowUpRightIcon'],
      mapping: {
        None: undefined,
        ArrowUpRightIcon,
      },
    },
    rightDecorator: {
      control: 'select',
      options: ['None', 'ArrowUpRightIcon'],
      mapping: {
        None: undefined,
        ArrowUpRightIcon,
      },
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<LinkStoryArgs>;

export const Default: Story = {
  args: {
    href: '/example',
    children: 'View documentation',
  },
};

export const WithRightDecorator: Story = {
  args: {
    href: '/example',
    children: 'Open in new tab',
    rightDecorator: ArrowUpRightIcon,
    iconWeight: 'bold',
  },
};

export const WithLeftDecorator: Story = {
  args: {
    href: '/example',
    children: 'Go back',
    leftDecorator: ArrowUpRightIcon,
    iconWeight: 'bold',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-space-4">
      <Link href="/example" variant="h1">
        Heading 1 link
      </Link>
      <Link href="/example" variant="h2">
        Heading 2 link
      </Link>
      <Link href="/example" variant="h3">
        Heading 3 link
      </Link>
      <Link href="/example" variant="h4">
        Heading 4 link
      </Link>
      <Link href="/example" variant="md">
        Medium link
      </Link>
      <Link href="/example" variant="sm">
        Small link
      </Link>
      <Link href="/example" variant="xs">
        Extra small link
      </Link>
      <Link href="/example" variant="body">
        Body link
      </Link>
    </div>
  ),
};

export const WithDecoratorAllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-space-4">
      <Link
        href="/example"
        variant="h1"
        rightDecorator={ArrowUpRightIcon}
        iconWeight="bold"
      >
        Heading 1 link
      </Link>
      <Link
        href="/example"
        variant="h2"
        rightDecorator={ArrowUpRightIcon}
        iconWeight="bold"
      >
        Heading 2 link
      </Link>
      <Link
        href="/example"
        variant="h3"
        rightDecorator={ArrowUpRightIcon}
        iconWeight="bold"
      >
        Heading 3 link
      </Link>
      <Link
        href="/example"
        variant="md"
        rightDecorator={ArrowUpRightIcon}
        iconWeight="bold"
      >
        Medium link
      </Link>
      <Link
        href="/example"
        variant="sm"
        rightDecorator={ArrowUpRightIcon}
        iconWeight="bold"
      >
        Small link
      </Link>
      <Link
        href="/example"
        variant="xs"
        rightDecorator={ArrowUpRightIcon}
        iconWeight="bold"
      >
        Extra small link
      </Link>
      <Link
        href="/example"
        variant="body"
        rightDecorator={ArrowUpRightIcon}
        iconWeight="bold"
      >
        Body link
      </Link>
    </div>
  ),
};

export const InlineWithText: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-space-3">
      <Link href="/home" variant="h1">
        Home
      </Link>
      <Text variant="body">
        For more information, visit the{' '}
        <Link
          href="/docs"
          variant="body"
          leftDecorator={FileTextIcon}
          iconWeight="bold"
        >
          documentation page
        </Link>{' '}
        or read the{' '}
        <Link
          href="https://docs.langchain.com/"
          variant="body"
          rightDecorator={ArrowUpRightIcon}
          iconWeight="bold"
        >
          LangSmith Docs
        </Link>
        .
      </Text>
      <Text variant="sm">
        Need help?{' '}
        <Link href="/support" variant="sm">
          Contact support
        </Link>
        .
      </Text>
    </div>
  ),
};

export const WithReactRouter: Story = {
  render: () => (
    <Link as={<RouterLink to="/example" />}>React Router link</Link>
  ),
};
