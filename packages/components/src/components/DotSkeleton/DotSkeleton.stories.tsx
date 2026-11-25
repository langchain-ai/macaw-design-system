import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '../Card';
import { Text } from '../Text';
import { DotSkeleton } from './DotSkeleton';

const meta = {
  title: 'Components/Status/DotSkeleton',
  component: DotSkeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs', 'loading', 'placeholder', 'dots', 'stat', 'skeleton'],
} satisfies Meta<typeof DotSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TableCell: Story = { args: { rows: 1, cols: 6 } };
export const StatCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-space-4 sm:grid-cols-3">
      {['Runs', 'Error rate', 'P50 latency'].map((label) => (
        <Card key={label} className="flex min-w-40 flex-col gap-space-4">
          <Text variant="sm" color="secondary">
            {label}
          </Text>
          <DotSkeleton />
        </Card>
      ))}
    </div>
  ),
};
