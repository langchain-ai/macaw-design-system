import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorBoundary } from './ErrorBoundary';
import { Text } from './Text';

const meta = {
  title: 'Components/Status/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs', 'react', 'render error', 'fallback'],
  args: {
    children: (
      <Text>Content renders normally until a child throws an error.</Text>
    ),
    fallback: (error) => <Text color="error">{error.message}</Text>,
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
