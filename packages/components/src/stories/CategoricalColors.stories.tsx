import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Text } from '../components/Text';

const palette = [
  'bg-categorical-1 text-categorical-1',
  'bg-categorical-2 text-categorical-2',
  'bg-categorical-3 text-categorical-3',
  'bg-categorical-4 text-categorical-4',
  'bg-categorical-5 text-categorical-5',
  'bg-categorical-6 text-categorical-6',
  'bg-categorical-7 text-categorical-7',
  'bg-categorical-8 text-categorical-8',
];

const labels = [
  'Research',
  'Planning',
  'Writing',
  'Review',
  'Search',
  'Analysis',
  'Support',
  'Operations',
  'Research again',
  'Planning again',
];

const meta: Meta = {
  title: 'Foundations/Categorical Colors',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const BadgesAndCards: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-space-6">
      <div className="flex flex-col gap-space-2">
        <Text variant="h3" weight="semibold">
          Cyclical categorical colors
        </Text>
        <Text color="secondary">
          Pair bg-categorical-1…8 with text-categorical-1…8. Use index % 8 to
          repeat the palette. These colors distinguish categories, not status.
        </Text>
      </div>
      <div className="flex flex-wrap gap-space-2">
        {labels.map((label, index) => (
          <Badge
            key={label}
            className={palette[index % palette.length]}
            leftDecorator={SparkleIcon}
          >
            {label}
          </Badge>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-space-3 sm:grid-cols-2 lg:grid-cols-4">
        {labels.map((label, index) => (
          <Card key={label}>
            <div className="flex items-center gap-space-3">
              <span
                className={`flex shrink-0 items-center justify-center rounded-md p-space-1 ${palette[index % palette.length]}`}
              >
                <SparkleIcon size={20} weight="regular" aria-hidden />
              </span>
              <Text variant="sm" weight="medium">
                {label}
              </Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};
