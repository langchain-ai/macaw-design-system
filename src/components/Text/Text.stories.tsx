import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';

const meta = {
  title: 'Foundations/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'md', 'sm', 'xs', 'body'],
    },
    weight: {
      control: { type: 'select' },
      options: ['semibold', 'medium', 'normal'],
    },
    as: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    variant: 'h1',
    children: 'Main Page Title',
  },
};

export const H2: Story = {
  args: {
    variant: 'h2',
    children: 'LCP Query Runs',
  },
};

export const H3: Story = {
  args: {
    variant: 'h3',
    children: 'Runs',
  },
};

export const H4: Story = {
  args: {
    variant: 'h4',
    children: 'Section Label',
  },
};

export const Medium: Story = {
  args: {
    variant: 'md',
    children: 'Primary CTA',
  },
};

export const Small: Story = {
  args: {
    variant: 'sm',
    children: 'LCP-Query-Runs',
  },
};

export const ExtraSmall: Story = {
  args: {
    variant: 'xs',
    children: 'Caption text',
  },
};

export const Body: Story = {
  args: {
    variant: 'body',
    children: 'This is body text for longer paragraphs and content.',
  },
};

export const WithCustomWeight: Story = {
  args: {
    variant: 'md',
    weight: 'medium',
    children: 'Medium weight text',
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Sample Text',
  },
  render: () => (
    <div className="flex max-w-2xl flex-col gap-space-5">
      <div className="space-y-space-2">
        <Text variant="h1">H1 - Main Page Title</Text>
        <p className="text-xs text-tertiary">
          Font weight: 500 | Font size: 24px | Line height: 100% | Letter
          Spacing: -4%
        </p>
      </div>

      <div className="space-y-space-2">
        <Text variant="h2">H2 - LCP Query Runs</Text>
        <p className="text-xs text-tertiary">
          Font weight: 500 | Font size: 18px | Line height: 120% | Letter
          Spacing: -4%
        </p>
      </div>

      <div className="space-y-space-2">
        <Text variant="h3">H3 - Runs</Text>
        <p className="text-xs text-tertiary">
          Font weight: 600 | Font size: 16px | Line height: 120% | Letter
          Spacing: -3%
        </p>
      </div>

      <div className="space-y-space-2">
        <Text variant="h4">H4 - Section Label</Text>
        <p className="text-xs text-tertiary">
          Font weight: 400 | Font size: 14px | Line height: 120% | Letter
          Spacing: -3% | Uppercase
        </p>
      </div>

      <div className="space-y-space-2">
        <Text variant="md">Medium - Primary CTA</Text>
        <p className="text-xs text-tertiary">
          Font size: 14px | Line height: 150% | Letter Spacing: -4%
        </p>
      </div>

      <div className="space-y-space-2">
        <Text variant="sm">Small - LCP-Query-Runs</Text>
        <p className="text-xs text-tertiary">
          Font size: 13px | Line height: 120% | Letter Spacing: -2%
        </p>
      </div>

      <div className="space-y-space-2">
        <Text variant="xs">Extra Small - Caption text</Text>
        <p className="text-xs text-tertiary">
          Font size: 12px | Line height: 100% | Letter Spacing: 0%
        </p>
      </div>

      <div className="space-y-space-2">
        <Text variant="body">
          Body - This is body text for longer paragraphs and content.
        </Text>
        <p className="text-xs text-tertiary">
          Font size: 14px | Line height: 150% | Letter Spacing: 0%
        </p>
      </div>
    </div>
  ),
};

export const WeightVariations: Story = {
  args: {
    children: 'Sample Text',
  },
  render: () => (
    <div className="flex max-w-2xl flex-col gap-space-5">
      <div className="space-y-space-3">
        <h3 className="text-sm font-medium text-primary">Semibold Weight</h3>
        <div className="space-y-space-2">
          <Text variant="h1" weight="semibold">
            H1 Semibold
          </Text>
          <Text variant="h2" weight="semibold">
            H2 Semibold
          </Text>
          <Text variant="h3" weight="semibold">
            H3 Semibold
          </Text>
          <Text variant="h4" weight="semibold">
            H4 Semibold
          </Text>
          <Text variant="md" weight="semibold" className="block">
            Medium Semibold
          </Text>
          <Text variant="sm" weight="semibold" className="block">
            Small Semibold
          </Text>
          <Text variant="xs" weight="semibold" className="block">
            Extra Small Semibold
          </Text>
          <Text variant="body" weight="semibold">
            Body Semibold
          </Text>
        </div>
      </div>

      <div className="space-y-space-3">
        <h3 className="text-sm font-medium text-primary">Medium Weight</h3>
        <div className="space-y-space-2">
          <Text variant="h1" weight="medium">
            H1 Medium
          </Text>
          <Text variant="h2" weight="medium">
            H2 Medium
          </Text>
          <Text variant="h3" weight="medium">
            H3 Medium
          </Text>
          <Text variant="h4" weight="medium">
            H4 Medium
          </Text>
          <Text variant="md" weight="medium" className="block">
            Medium Medium
          </Text>
          <Text variant="sm" weight="medium" className="block">
            Small Medium
          </Text>
          <Text variant="xs" weight="medium" className="block">
            Extra Small Medium
          </Text>
          <Text variant="body" weight="medium">
            Body Medium
          </Text>
        </div>
      </div>

      <div className="space-y-space-3">
        <h3 className="text-sm font-medium text-primary">Normal Weight</h3>
        <div className="space-y-space-2">
          <Text variant="h1" weight="normal">
            H1 Normal
          </Text>
          <Text variant="h2" weight="normal">
            H2 Normal
          </Text>
          <Text variant="h3" weight="normal">
            H3 Normal
          </Text>
          <Text variant="h4" weight="normal">
            H4 Normal
          </Text>
          <Text variant="md" weight="normal" className="block">
            Medium Normal
          </Text>
          <Text variant="sm" weight="normal" className="block">
            Small Normal
          </Text>
          <Text variant="xs" weight="normal" className="block">
            Extra Small Normal
          </Text>
          <Text variant="body" weight="normal">
            Body Normal
          </Text>
        </div>
      </div>
    </div>
  ),
};

export const SemanticOverride: Story = {
  args: {
    children: 'This is H2 styling on an H1 tag',
  },
  render: () => (
    <div className="space-y-space-4">
      <Text variant="h2">Default: H2 as H2</Text>
      <Text variant="h3" as="p">
        Override: H3 styling as P tag
      </Text>
    </div>
  ),
};

export const Examples: Story = {
  args: {
    children: 'Sample Text',
  },
  render: () => (
    <div className="max-w-4xl space-y-space-6">
      <section>
        <Text variant="h2" className="mb-space-4">
          LCP Query Runs
        </Text>
        <div className="flex gap-space-4">
          <div className="rounded bg-surface-level-2 p-space-4">
            <Text variant="h3" className="mb-space-2">
              Runs
            </Text>
            <div className="mb-space-3 flex gap-space-2">
              <span className="rounded bg-blue-100 px-space-2 py-space-1 text-xs text-blue-800">
                Runs
              </span>
              <span className="rounded bg-surface-level-3 px-space-2 py-space-1 text-xs text-tertiary">
                Online Evals
              </span>
              <span className="rounded bg-surface-level-3 px-space-2 py-space-1 text-xs text-tertiary">
                Threads
              </span>
              <span className="rounded bg-surface-level-3 px-space-2 py-space-1 text-xs text-tertiary">
                Automations
              </span>
            </div>
            <div className="space-y-space-2">
              <div className="flex items-center justify-between">
                <Text variant="md">Dashboard</Text>
                <Text variant="md">Evals</Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <Text variant="h3" className="mb-space-2">
          LangChain Traces
        </Text>
        <Text variant="sm" className="text-tertiary">
          LCP-Query-Runs
        </Text>
      </section>
    </div>
  ),
};
