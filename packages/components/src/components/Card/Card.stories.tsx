import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '.';
import { Divider } from '../Divider';
import { Text } from '../Text';

const meta: Meta<typeof Card> = {
  title: 'Components/Layout/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'surface', 'container', 'panel'],
  argTypes: {
    className: {
      control: 'text',
    },
    intent: {
      control: 'select',
      options: ['plain', 'neutral', 'info'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    intent: 'neutral',
    children: (
      <div className="gap-space-4 flex flex-col">
        <div className="gap-space-1 flex flex-col">
          <Text weight="medium">Project activity</Text>
          <Text variant="sm" color="tertiary">
            Cards have room for supporting context and structured content.
          </Text>
        </div>
        <div className="gap-space-3 grid grid-cols-3">
          <div className="gap-space-1 flex flex-col">
            <Text variant="xs" color="tertiary">
              Traces
            </Text>
            <Text weight="medium">1,284</Text>
          </div>
          <div className="gap-space-1 flex flex-col">
            <Text variant="xs" color="tertiary">
              Datasets
            </Text>
            <Text weight="medium">12</Text>
          </div>
          <div className="gap-space-1 flex flex-col">
            <Text variant="xs" color="tertiary">
              Members
            </Text>
            <Text weight="medium">8</Text>
          </div>
        </div>
        <div className="gap-space-3 flex flex-col">
          <Divider weight="strong" />
          <Text variant="xs" color="tertiary">
            Updated a few minutes ago
          </Text>
        </div>
      </div>
    ),
  },
};

export const AllIntents: Story = {
  render: () => (
    <div className="gap-space-4 flex flex-col">
      <Card intent="plain">
        <div className="gap-space-1 flex flex-col">
          <Text weight="medium">Plain</Text>
          <Text variant="sm" color="tertiary">
            Elevated content on a muted border.
          </Text>
        </div>
      </Card>
      <Card intent="neutral">
        <div className="gap-space-1 flex flex-col">
          <Text weight="medium">Neutral</Text>
          <Text variant="sm" color="tertiary">
            The default surface for general content.
          </Text>
        </div>
      </Card>
      <Card intent="info">
        <div className="gap-space-1 flex flex-col">
          <Text weight="medium">Info</Text>
          <Text variant="sm" color="tertiary">
            A brand-tinted surface for informational content.
          </Text>
        </div>
      </Card>
    </div>
  ),
};
