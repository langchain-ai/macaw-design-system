import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from '.';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/Display/DescriptionList',
  component: DescriptionList,
  tags: [
    'autodocs',
    'a11y-test',
    'metadata',
    'key value',
    'details',
    'properties',
  ],
  parameters: { layout: 'centered', a11y: { test: 'error' } },
  decorators: [
    (Story) => (
      <div className="w-xl max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

function Metadata({ layout }: { layout?: 'responsive' | 'stacked' }) {
  return (
    <DescriptionList layout={layout} aria-label="Deployment details">
      <DescriptionListItem>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDetail>
          <Badge>Ready</Badge>
        </DescriptionListDetail>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Environment</DescriptionListTerm>
        <DescriptionListDetail>Production</DescriptionListDetail>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Repository</DescriptionListTerm>
        <DescriptionListDetail>langchain-ai/langgraph</DescriptionListDetail>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Retries</DescriptionListTerm>
        <DescriptionListDetail>{0}</DescriptionListDetail>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Description</DescriptionListTerm>
        <DescriptionListDetail>
          Processes incoming requests and records traces for evaluation.
          <br />
          Updated by the deployment workflow.
        </DescriptionListDetail>
      </DescriptionListItem>
    </DescriptionList>
  );
}

export const Default: Story = {
  render: (args) => (
    <Card className="w-full">
      <Text variant="h3">Deployment Details</Text>
      <Metadata layout={args.layout} />
    </Card>
  ),
};

export const Stacked: Story = {
  render: () => <Metadata layout="stacked" />,
};

export const Narrow: Story = {
  render: () => (
    <Card className="w-64">
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Deployment Identifier</DescriptionListTerm>
          <DescriptionListDetail>
            deployment_01a1667cb8457221ba304173023a99d4
          </DescriptionListDetail>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Repository</DescriptionListTerm>
          <DescriptionListDetail>
            github.com/langchain-ai/langgraph
          </DescriptionListDetail>
        </DescriptionListItem>
      </DescriptionList>
    </Card>
  ),
};

export const LoadingAndMissingValues: Story = {
  render: () => (
    <DescriptionList aria-label="Configuration summary">
      <DescriptionListItem>
        <DescriptionListTerm>Region</DescriptionListTerm>
        <DescriptionListDetail>
          <span className="sr-only">Loading region</span>
          <span aria-hidden="true">
            <Skeleton as="span" className="inline-block w-32" />
          </span>
        </DescriptionListDetail>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Description</DescriptionListTerm>
        <DescriptionListDetail>Not provided</DescriptionListDetail>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Latest Revision</DescriptionListTerm>
        <DescriptionListDetail>
          <Text as="span" color="error">
            Could not load the revision. Try refreshing.
          </Text>
        </DescriptionListDetail>
      </DescriptionListItem>
    </DescriptionList>
  ),
};
