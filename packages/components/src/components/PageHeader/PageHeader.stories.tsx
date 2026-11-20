import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../Badge';
import { Breadcrumb, BreadcrumbLink, BreadcrumbPage } from '../Breadcrumb';
import { Button } from '../Button';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { PageHeader } from './PageHeader';

const meta = {
  title: 'Components/Layout/PageHeader',
  component: PageHeader,
  tags: [
    'autodocs',
    'a11y-test',
    'page header',
    'page title',
    'layout',
    'start',
    'end',
    'slots',
    'actions',
    'breadcrumb',
  ],
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
    docs: {
      description: {
        component:
          'A header with two optional content slots: start grows to fill the row, and end aligns trailing content and wraps below when space runs out. Compose titles, descriptions, breadcrumbs, badges, tabs, and actions using existing components. PageHeader supplies the semantic header, surface, bottom border, and spacing; consumers own headings and interactions. Use className to adjust the outer layout.',
      },
    },
  },
  argTypes: { start: { control: false }, end: { control: false } },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    start: (
      <Text as="h1" variant="h2">
        Projects
      </Text>
    ),
    end: (
      <Button size="md" leftDecorator={PlusIcon}>
        Create project
      </Button>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    start: (
      <div className="flex min-w-0 flex-col gap-space-1">
        <div className="flex flex-wrap items-center gap-space-2">
          <Text as="h1" variant="h2">
            OAuth Applications
          </Text>
          <Badge size="sm" color="secondary">
            Beta
          </Badge>
        </div>
        <Text as="p" variant="sm" color="secondary">
          Apps that let users sign in and call the API on their behalf.
        </Text>
      </div>
    ),
    end: (
      <>
        <Button size="md" color="secondary" variant="outlined">
          Docs
        </Button>
        <Button size="md" leftDecorator={PlusIcon}>
          Create application
        </Button>
      </>
    ),
  },
};

export const WithBreadcrumb: Story = {
  args: {
    start: (
      <Breadcrumb>
        <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
        <BreadcrumbPage>Support Agent</BreadcrumbPage>
      </Breadcrumb>
    ),
    end: (
      <>
        <Badge size="sm" color="secondary">
          Healthy
        </Badge>
        <Button size="md" color="secondary" variant="outlined">
          Settings
        </Button>
      </>
    ),
  },
};

export const StartOnly: Story = {
  args: {
    start: (
      <Text as="h1" variant="h2">
        Overview
      </Text>
    ),
  },
};

export const EndOnly: Story = {
  args: {
    end: (
      <Button size="md" color="secondary" variant="outlined">
        Export
      </Button>
    ),
  },
};

export const Loading: Story = {
  args: {
    'aria-label': 'Loading page header',
    'aria-busy': true,
    start: (
      <div className="flex w-full max-w-sm flex-col gap-space-2">
        <Skeleton className="h-5 w-40 max-w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    ),
    end: (
      <Button size="md" disabled>
        Create project
      </Button>
    ),
  },
};

export const Narrow: Story = {
  args: WithDescription.args,
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};

export const LongTitle: Story = {
  args: {
    start: (
      <Text
        as="h1"
        variant="h2"
        className="min-w-0 truncate"
        title="Support Agent with a Long Project Name for Production Experiments"
      >
        Support Agent with a Long Project Name for Production Experiments
      </Text>
    ),
    end: (
      <Button size="md" color="secondary" variant="outlined">
        Settings
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};
