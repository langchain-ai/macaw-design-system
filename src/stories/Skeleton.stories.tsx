import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  CircleSkeleton,
  Skeleton,
  SkeletonRows,
} from '../components/Skeleton/Skeleton';

const meta = {
  title: 'Components/Status/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: { type: 'select' },
      options: ['div', 'span'],
    },
    className: { control: { type: 'text' } },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single placeholder bar. Callers set height/width via `className`. */
export const Default: Story = {
  args: {
    className: 'h-4 w-full',
  },
};

/** `SkeletonRows` renders `n` stacked bars — e.g. a loading list or paragraph. */
export const Rows: Story = {
  render: () => <SkeletonRows rows={4} />,
};

/** `CircleSkeleton` for avatar/icon placeholders. */
export const Circle: Story = {
  render: () => <CircleSkeleton />,
};

/**
 * Composing the primitives into a list-row loading state: an avatar next to a
 * title and subtitle (mirrors `AgentCard` / inbox row skeletons).
 */
export const ListRow: Story = {
  render: () => (
    <div className="flex items-center gap-space-3">
      <CircleSkeleton className="size-10 shrink-0" />
      <div className="flex flex-1 flex-col gap-space-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  ),
};
