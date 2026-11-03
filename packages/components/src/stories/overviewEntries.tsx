import { useId, useState, type ReactNode } from 'react';

import { Accordion, AccordionItem } from '../components/Accordion';
import { Attachment, AttachmentList } from '../components/Attachment';
import { BarChart } from '../components/BarChart';
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbPage,
} from '../components/Breadcrumb';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ChartCard } from '../components/ChartCard';
import {
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
} from '../components/ChatConversationList';
import { ChatMessage } from '../components/ChatMessage';
import { Code } from '../components/Code';
import { DonutChart } from '../components/DonutChart';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { HeatmapChart } from '../components/HeatmapChart';
import { ImagePreviewBlock } from '../components/ImagePreviewBlock';
import { ImagePreviewDialog } from '../components/ImagePreviewDialog';
import { LineChart } from '../components/LineChart';
import { MetricChart } from '../components/MetricChart';
import { Pane } from '../components/Pane';
import { PlainTextEditor } from '../components/PlainTextEditor';
import { RadioButton } from '../components/RadioButton';
import { RadioGroup } from '../components/RadioGroup';
import { SankeyChart } from '../components/SankeyChart';
import { SparkLineChart } from '../components/SparkLineChart';
import { SplitViewPane } from '../components/SplitViewPane';
import { StatusBadge } from '../components/StatusBadge';
import { Text } from '../components/Text';
import { TextVirtualizer } from '../components/TextVirtualizer';
import { TextWithLinks } from '../components/TextWithLinks';
import { LoadingIndicator } from '../components/ThinkingState';
import { TopList } from '../components/TopList';
import UnsavedChangesDialog from '../components/UnsavedChangesDialog';
import { getCategoricalFillChartColor } from '../utils/chartColors';
import sampleImage from './assets/attachment-preview.png';

const points = [18, 32, 25, 48, 42].map((y, x) => ({ x, y }));
const segments = ['Production', 'Staging', 'Development'].map(
  (label, index) => ({
    id: label,
    label,
    value: [58, 28, 14][index],
    color: getCategoricalFillChartColor(index),
  })
);

function CodeDemo() {
  const [value, setValue] = useState('const greeting = "Hello, world!";');
  return (
    <Code
      ariaLabel="Example code"
      language="javascript"
      value={value}
      onChange={setValue}
    />
  );
}

function PlainTextEditorDemo() {
  const id = useId();
  return (
    <div className="flex w-full min-w-0 flex-col gap-space-2">
      <Text as="label" htmlFor={id} variant="xs" color="secondary">
        Notes
      </Text>
      <PlainTextEditor id={id} value="Edit this text or paste a link." />
    </div>
  );
}

function ConversationListDemo() {
  const [selected, setSelected] = useState('planning');
  return (
    <ChatConversationList aria-label="Example conversations" className="w-full">
      <ChatConversationListGroup title="Projects" defaultOpen>
        <ChatConversationListItem
          title="Release planning"
          selected={selected === 'planning'}
          onClick={() => setSelected('planning')}
        />
        <ChatConversationListItem
          title="Research notes"
          unread
          selected={selected === 'research'}
          onClick={() => setSelected('research')}
        />
      </ChatConversationListGroup>
    </ChatConversationList>
  );
}

function ImagePreviewDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" color="secondary" onClick={() => setOpen(true)}>
        Preview image
      </Button>
      <ImagePreviewDialog
        open={open}
        onOpenChange={setOpen}
        src={sampleImage}
        altText="Workflow illustration"
        title="Workflow"
      />
    </>
  );
}

function PaneDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" color="secondary" onClick={() => setOpen(true)}>
        Open pane
      </Button>
      <Pane open={open} onClose={() => setOpen(false)} title="Project Settings">
        <Text variant="sm">Edit project details in a modal side pane.</Text>
      </Pane>
    </>
  );
}

function SplitViewPaneDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" color="secondary" onClick={() => setOpen(true)}>
        Inspect details
      </Button>
      <SplitViewPane open={open} onClose={() => setOpen(false)} title="Details">
        <div className="p-space-5">
          <Text variant="sm">
            The overview remains available while you inspect this panel.
          </Text>
        </div>
      </SplitViewPane>
    </>
  );
}

function UnsavedChangesDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" color="secondary" onClick={() => setOpen(true)}>
        Review unsaved changes
      </Button>
      <UnsavedChangesDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        onDiscard={() => setOpen(false)}
        title="Unsaved Changes"
        description="Save your changes before leaving?"
      />
    </>
  );
}

type OverviewEntry = {
  name: string;
  category: string;
  storybookTitle?: string;
  bodyClassName?: string;
  render: () => ReactNode;
};

export const additionalOverviewEntries: OverviewEntry[] = [
  {
    name: 'PlainTextEditor',
    category: 'inputs',
    render: () => <PlainTextEditorDemo />,
  },
  {
    name: 'LoadingIndicator',
    category: 'status',
    storybookTitle: 'Components/Status/ThinkingState',
    render: () => (
      <div role="status" className="flex items-center gap-space-2">
        <LoadingIndicator size="sm" />
        <Text variant="sm">Generating</Text>
      </div>
    ),
  },
  {
    name: 'RadioGroup',
    category: 'inputs',
    render: () => (
      <RadioGroup aria-label="Notification frequency" defaultValue="daily">
        <RadioButton value="daily" label="Daily" />
        <RadioButton value="weekly" label="Weekly" />
      </RadioGroup>
    ),
  },
  {
    name: 'Breadcrumb',
    category: 'navigation',
    render: () => (
      <Breadcrumb>
        <BreadcrumbLink href="#overview-navigation">Projects</BreadcrumbLink>
        <BreadcrumbPage>Overview</BreadcrumbPage>
      </Breadcrumb>
    ),
  },
  {
    name: 'Accordion',
    category: 'layout',
    render: () => (
      <Accordion className="w-full">
        <AccordionItem
          title="Notifications"
          contents={<Text variant="sm">Email and in-app updates.</Text>}
        />
        <AccordionItem
          title="Privacy"
          contents={<Text variant="sm">Manage who can see your activity.</Text>}
        />
      </Accordion>
    ),
  },
  {
    name: 'Card',
    category: 'layout',
    render: () => (
      <Card className="w-full">
        <Text weight="medium">Project Activity</Text>
        <Text variant="sm" color="secondary">
          A surface for related content.
        </Text>
      </Card>
    ),
  },
  { name: 'Pane', category: 'layout', render: () => <PaneDemo /> },
  {
    name: 'SplitViewPane',
    category: 'layout',
    render: () => <SplitViewPaneDemo />,
  },
  {
    name: 'UnsavedChangesDialog',
    category: 'layout',
    render: () => <UnsavedChangesDemo />,
  },
  {
    name: 'Attachment',
    category: 'display',
    render: () => (
      <AttachmentList layout="stack" className="w-full">
        <Attachment
          name="report.pdf"
          contentType="application/pdf"
          metadata="240 KB"
        />
        <Attachment
          name="notes.txt"
          contentType="text/plain"
          metadata="12 KB"
        />
      </AttachmentList>
    ),
  },
  {
    name: 'Code',
    category: 'display',
    render: () => (
      <div className="w-full min-w-0">
        <CodeDemo />
      </div>
    ),
  },
  {
    name: 'ImagePreviewBlock',
    category: 'display',
    render: () => (
      <ImagePreviewBlock
        src={sampleImage}
        altText="Workflow illustration"
        caption="Click to zoom"
      />
    ),
  },
  {
    name: 'ImagePreviewDialog',
    category: 'display',
    render: () => <ImagePreviewDemo />,
  },
  {
    name: 'StatusBadge',
    category: 'display',
    render: () => (
      <div className="flex flex-wrap gap-space-2">
        <StatusBadge variant="success">Active</StatusBadge>
        <StatusBadge variant="warning">Pending</StatusBadge>
        <StatusBadge variant="error">Failed</StatusBadge>
      </div>
    ),
  },
  {
    name: 'TextWithLinks',
    category: 'display',
    render: () => (
      <div className="min-w-0">
        <TextWithLinks text="Read the guide at docs.langchain.com to get started." />
      </div>
    ),
  },
  {
    name: 'TextVirtualizer',
    category: 'display',
    render: () => (
      <TextVirtualizer
        containerHeight="10rem"
        chunkSize={300}
        style={{ whiteSpace: 'pre-wrap' }}
        text={Array.from(
          { length: 100 },
          (_, i) => `Line ${i + 1}: Scroll to read more.\n`
        ).join('')}
      />
    ),
  },
  {
    name: 'ErrorBoundary',
    category: 'status',
    render: () => (
      <ErrorBoundary
        fallback={() => (
          <Text variant="sm" color="error">
            Content could not load.
          </Text>
        )}
      >
        <Text variant="sm" color="secondary">
          This content is protected by an error boundary.
        </Text>
      </ErrorBoundary>
    ),
  },
  {
    name: 'ChatConversationList',
    category: 'chat',
    render: () => <ConversationListDemo />,
  },
  {
    name: 'ChatMessage',
    category: 'chat',
    render: () => (
      <ChatMessage
        message={{
          id: 'overview-answer',
          role: 'assistant',
          status: 'completed',
          content: [
            {
              id: 'answer',
              type: 'text',
              text: 'Here is a short answer with the details you requested.',
            },
          ],
        }}
      />
    ),
  },
  {
    name: 'ChartCard',
    category: 'charts',
    bodyClassName: 'p-space-4',
    render: () => (
      <ChartCard title="Total Requests" className="h-40 w-full">
        <MetricChart value="1,248" size="sm" />
      </ChartCard>
    ),
  },
  {
    name: 'BarChart',
    category: 'charts',
    bodyClassName: 'p-space-4',
    render: () => (
      <div className="h-40 w-full">
        <BarChart
          aria-label="Requests by day"
          series={[
            {
              id: 'requests',
              label: 'Requests',
              data: points.map(({ x, y }) => ({
                category: `Day ${x + 1}`,
                value: y,
              })),
            },
          ]}
        />
      </div>
    ),
  },
  {
    name: 'LineChart',
    category: 'charts',
    bodyClassName: 'p-space-4',
    render: () => (
      <div className="h-40 w-full">
        <LineChart
          aria-label="Requests over time"
          series={[{ id: 'requests', label: 'Requests', points }]}
        />
      </div>
    ),
  },
  {
    name: 'DonutChart',
    category: 'charts',
    bodyClassName: 'p-space-4',
    render: () => (
      <div className="h-40 w-full">
        <DonutChart
          aria-label="Requests by environment"
          segments={segments}
          centerNumber="100"
          showLegend={false}
        />
      </div>
    ),
  },
  {
    name: 'SparkLineChart',
    category: 'charts',
    render: () => (
      <SparkLineChart
        className="h-16 w-full"
        aria-label="Request trend"
        data={points}
      />
    ),
  },
  {
    name: 'MetricChart',
    category: 'charts',
    render: () => (
      <MetricChart
        value="1,248"
        secondaryContent={
          <Text variant="xs" color="secondary">
            Requests this week
          </Text>
        }
      />
    ),
  },
  {
    name: 'HeatmapChart',
    category: 'charts',
    render: () => (
      <HeatmapChart
        aria-label="Daily completion rate"
        data={[
          [10, 40, 70, 100],
          [25, 60, 85, 45],
          [90, 30, 55, 75],
        ]}
      />
    ),
  },
  {
    name: 'SankeyChart',
    category: 'charts',
    bodyClassName: 'p-space-4',
    render: () => (
      <div className="h-40 w-full">
        <SankeyChart
          aria-label="Request outcomes"
          nodes={[
            { id: 'requests', label: 'Requests' },
            { id: 'success', label: 'Success' },
            { id: 'error', label: 'Error' },
          ]}
          links={[
            { sourceId: 'requests', targetId: 'success', value: 80 },
            { sourceId: 'requests', targetId: 'error', value: 20 },
          ]}
          showLegend={false}
        />
      </div>
    ),
  },
  {
    name: 'TopList',
    category: 'charts',
    bodyClassName: 'p-space-4',
    render: () => (
      <div className="h-40 w-full">
        <TopList
          aria-label="Top environments"
          items={segments}
          categoryLabelWidth={88}
        />
      </div>
    ),
  },
];
