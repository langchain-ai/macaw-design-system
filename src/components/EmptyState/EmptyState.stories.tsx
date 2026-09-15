import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';
import { LockIcon } from '@phosphor-icons/react/dist/ssr/Lock';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmptyState } from '.';
import type { EmptyStateSize, EmptyStateVariant } from '.';
import { PlusIcon } from '../../icons/PaddedPhosphorIcons';
import { Button } from '../Button';

const emptyStateSizes: EmptyStateSize[] = ['sm', 'md', 'lg'];
const emptyStateVariants: EmptyStateVariant[] = ['neutral', 'brand'];

const meta = {
  title: 'Components/Status/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'no data', 'zero results', 'blank state'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    variant: { control: 'select', options: ['neutral', 'brand'] },
    docsLink: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    icon: {
      control: 'select',
      options: ['None', 'Users', 'Database', 'Lock', 'BarChart'],
      mapping: {
        None: undefined,
        Users: UsersIcon,
        Database: DatabaseIcon,
        Lock: LockIcon,
        BarChart: ChartBarIcon,
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Minimal state — a single title. Used in inline table empty rows. */
export const Default: Story = {
  args: {
    title: 'No logs found',
  },
};

/** Title with supporting copy — the most common table/no-data shape. */
export const TitleAndDescription: Story = {
  args: {
    title: 'No runs found',
    description: 'There are no runs matching the current filters.',
  },
};

/** With a custom icon in the default neutral treatment. */
export const WithIcon: Story = {
  args: {
    title: 'No members found',
    icon: UsersIcon,
  },
};

/** Full onboarding pattern: prominent brand icon, action button, and docs link. */
export const Onboarding: Story = {
  args: {
    title: 'No datasets found',
    description: 'Start by creating a new dataset',
    icon: DatabaseIcon,
    variant: 'brand',
    docsLink:
      'https://docs.langchain.com/langsmith/manage-datasets-in-application',
  },
  render: (args) => (
    <EmptyState
      {...args}
      action={<Button leftDecorator={PlusIcon}>Dataset</Button>}
    />
  ),
};

/** Gated / no-access state with a lock icon and a settings action. */
export const NoAccess: Story = {
  args: {
    title: 'No access',
    description:
      'You do not have permission to view this resource. Contact a workspace admin for access.',
    icon: LockIcon,
  },
  render: (args) => (
    <EmptyState
      {...args}
      action={
        <Button variant="outlined" color="secondary">
          Workspace settings
        </Button>
      }
    />
  ),
};

/** The complete visual scale across neutral and brand treatments. */
export const SizesAndVariants: Story = {
  args: {
    title: 'No automation rules',
  },
  render: () => (
    <div className="grid grid-cols-1 gap-space-5 lg:grid-cols-3">
      {emptyStateVariants.map((variant) =>
        emptyStateSizes.map((size) => (
          <EmptyState
            key={`${variant}-${size}`}
            title={`${variant} ${size} empty state`}
            description="Automation rules run evaluators over incoming traces."
            icon={ChartBarIcon}
            size={size}
            variant={variant}
          />
        ))
      )}
    </div>
  ),
};
