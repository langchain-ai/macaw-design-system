import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../components/Badge';
import { ChartCard } from '../components/ChartCard';
import { Icon } from '../components/Icon';
import {
  formatMetricCurrency,
  formatMetricDate,
  formatMetricDuration,
  formatMetricNumber,
  formatMetricTime,
  MetricChart,
} from '../components/MetricChart';
import { Text } from '../components/Text';
import { ArrowDownIcon, ArrowUpIcon } from '../icons/PaddedPhosphorIcons';
import { cn } from '../utils/cn';

const meta: Meta<typeof MetricChart> = {
  title: 'Components/Charts/MetricChart',
  component: MetricChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a metric value with optional composable secondary content. Use its formatter helpers for compact numbers, currency, dates, times, and durations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['default', 'centered'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ValueOnly: Story = {
  args: {
    value: '1,248,392',
  },
  render: (args) => <MetricChart {...args} className="flex-1 justify-center" />,
};

export const FormattedValues: Story = {
  render: () => {
    const date = Date.UTC(2026, 0, 15, 17, 30);
    const examples = [
      { title: 'Compact number', value: formatMetricNumber(200_000_000) },
      { title: 'Currency', value: formatMetricCurrency(12_500) },
      { title: 'Date', value: formatMetricDate(date, { timeZone: 'UTC' }) },
      { title: 'Time', value: formatMetricTime(date, { timeZone: 'UTC' }) },
      {
        title: 'Duration',
        value: formatMetricDuration(842, { unit: 'millisecond' }),
      },
    ];

    return (
      <div className="grid grid-cols-5">
        {examples.map((example, index) => (
          <ChartCard
            key={example.title}
            title={example.title}
            className={cn('h-28', index > 0 && 'border-l-0')}
          >
            <MetricChart
              value={example.value}
              className="flex-1 justify-center"
            />
          </ChartCard>
        ))}
      </div>
    );
  },
};

export const SecondaryContent: Story = {
  args: {
    value: '$5.67',
    secondaryContent: (
      <>
        <Icon
          icon={ArrowDownIcon}
          size="sm"
          className="text-error-secondary"
          role="img"
          aria-label="Decrease"
        />
        <Text variant="sm" color="error">
          17.5%
        </Text>
        <Text variant="sm" color="secondary">
          vs. prev week
        </Text>
      </>
    ),
  },
  render: (args) => (
    <div className="grid grid-cols-2">
      <ChartCard title="Weekly spend" className="h-32 w-80">
        <MetricChart {...args} className="flex-1 justify-center" />
      </ChartCard>
      <ChartCard title="Evaluation quality" className="h-32 w-80 border-l-0">
        <MetricChart
          value={98.7}
          className="flex-1 justify-center"
          secondaryContent={
            <>
              <Badge size="sm" color="success">
                Healthy
              </Badge>
              <Text variant="sm" color="secondary">
                quality score
              </Text>
            </>
          }
        />
      </ChartCard>
    </div>
  ),
};

export const SizeVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'XL scales to the available card width after padding, caps at 80px, and stays on one line.',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-space-4">
      <ChartCard title="Small" className="h-20 w-56">
        <MetricChart
          size="sm"
          value="1,248,392"
          className="flex-1 justify-center"
          secondaryContent={
            <>
              <Icon
                icon={ArrowDownIcon}
                size="sm"
                className="text-error-secondary"
                role="img"
                aria-label="Decrease"
              />
              <Text variant="xs" color="error">
                17.5%
              </Text>
              <Text variant="xs" color="secondary">
                vs. prev week
              </Text>
            </>
          }
        />
      </ChartCard>
      <ChartCard title="Medium" className="h-32 w-56">
        <MetricChart
          size="md"
          value="1,248,392"
          className="flex-1 justify-center"
          secondaryContent={
            <>
              <Badge size="sm" color="success">
                Healthy
              </Badge>
              <Text variant="sm" color="secondary">
                vs. prev week
              </Text>
            </>
          }
        />
      </ChartCard>
      <ChartCard title="Large" className="h-32 w-56">
        <MetricChart
          size="lg"
          value="1,248,392"
          className="flex-1 justify-center"
          secondaryContent={
            <>
              <Icon
                icon={ArrowUpIcon}
                size="sm"
                className="text-success-secondary"
                role="img"
                aria-label="Increase"
              />
              <Text variant="md" color="success">
                5%
              </Text>
              <Text variant="md" color="secondary">
                vs. prev week
              </Text>
            </>
          }
        />
      </ChartCard>
      <ChartCard title="Extra large" className="h-48 w-80">
        <MetricChart
          size="xl"
          value="1,248,392"
          className="flex-1 justify-center"
          secondaryContent={
            <>
              <Icon
                icon={ArrowUpIcon}
                size="sm"
                className="text-success-secondary"
                role="img"
                aria-label="Increase"
              />
              <Text variant="body" color="success">
                5%
              </Text>
              <Text variant="body" color="secondary">
                vs. prev week
              </Text>
            </>
          }
        />
      </ChartCard>
    </div>
  ),
};
