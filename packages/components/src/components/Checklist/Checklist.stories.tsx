import { useState } from 'react';

import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checklist, ChecklistItem, ChecklistSection } from '.';
import { Banner } from '../Banner';
import { Button } from '../Button';
import { GroupedTabs } from '../GroupedTabs';
import { IconButton } from '../IconButton';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';

const meta = {
  title: 'Components/Checklist',
  component: Checklist,
  tags: [
    'autodocs',
    'a11y-test',
    'checklist',
    'onboarding',
    'setup',
    'tasks',
    'progress',
  ],
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' },
    docs: {
      description: {
        component:
          'Compact onboarding tasks with a circular summary, optional section trackers, and expandable content. Completed labels never use strikethrough. Compose ChecklistItem directly or inside ChecklistSection. The host owns completion, task ordering, path selection, dismissal, auto-open/close, loading, errors, and persistence. Control expansion with expanded/onExpandedChange or initialize with defaultExpanded. Task and section bodies stay mounted while collapsed to preserve form state. Use noninteractive content in row summaries; put controls in the body or Checklist action.',
      },
    },
  },
  args: { title: 'Get the most out of Engine', completed: 3, total: 6 },
  decorators: [
    (Story) => (
      <div className="w-[min(28rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

function EngineChecklist() {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [agent, setAgent] = useState('Codex');
  return (
    <Checklist
      title="Get the most out of Engine"
      completed={saved ? 4 : 3}
      total={6}
    >
      <ChecklistItem
        title="Connect a code repository"
        status="completed"
        trailingContent="acme/agent"
      />
      <ChecklistItem
        title="Post new issues to Slack"
        status="completed"
        trailingContent="#agent-alerts"
      />
      <ChecklistItem
        title="Open a pull request for every fix"
        status="completed"
      />
      <ChecklistItem
        title="Hand new issues to a coding agent"
        status={saved ? 'completed' : 'pending'}
        trailingContent={saved ? agent : 'Recommended'}
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        <div className="flex flex-col gap-space-3">
          <Text as="p" variant="sm" color="secondary">
            Mention your agent in each new issue’s Slack thread so it can
            investigate and open a fix.
          </Text>
          <Text as="p" variant="xs" weight="medium">
            Mention agent on new issues
          </Text>
          <div className="flex flex-wrap gap-space-2">
            {['Codex', 'Cursor', 'Your own coding agent'].map((name) => (
              <Button
                key={name}
                size="sm"
                color={agent === name ? 'primary' : 'secondary'}
                variant={agent === name ? 'normal' : 'outlined'}
                aria-pressed={agent === name}
                onClick={() => setAgent(name)}
              >
                {name}
              </Button>
            ))}
          </div>
          <Text as="p" variant="xs" color="tertiary">
            Add the agent to the Slack channel first, or it won’t see the
            mention.
          </Text>
          <div className="flex flex-wrap gap-space-2">
            <Button
              size="sm"
              onClick={() => {
                setSaved(true);
                setExpanded(false);
              }}
            >
              Save agent
            </Button>
            <Button
              size="sm"
              variant="plain"
              color="secondary"
              onClick={() => setExpanded(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </ChecklistItem>
      <ChecklistItem title="Verify fixes with preview Agent Servers">
        <Text variant="sm" color="secondary">
          Connect a preview to verify proposed fixes.
        </Text>
      </ChecklistItem>
      <ChecklistItem title="Sync issues to Linear">
        <Button size="sm">Connect Linear</Button>
      </ChecklistItem>
    </Checklist>
  );
}

export const Default: Story = { render: () => <EngineChecklist /> };

function GroupedChecklist() {
  const [built, setBuilt] = useState(false);
  const [path, setPath] = useState('Build an agent');
  const [dismissed, setDismissed] = useState(false);
  if (dismissed)
    return (
      <Button
        color="secondary"
        variant="outlined"
        onClick={() => setDismissed(false)}
      >
        Show checklist
      </Button>
    );
  return (
    <Checklist
      title="Get started with LangSmith"
      completed={built ? 3 : 2}
      total={9}
      action={
        <IconButton
          icon={XIcon}
          label="Dismiss checklist"
          size="sm"
          variant="plain"
          color="secondary"
          onClick={() => setDismissed(true)}
        />
      }
    >
      <div className="px-space-2 pb-space-2">
        <GroupedTabs
          value={path}
          onChange={setPath}
          size="sm"
          className="max-w-full"
          options={['Connect an agent', 'Build an agent'].map((name) => ({
            value: name,
            display: name,
            className: 'min-w-0',
            textClassName: 'truncate',
            'aria-label': name,
          }))}
        />
      </div>
      <ChecklistSection
        title="Get Started"
        steps={[true, built, false, true]}
        defaultExpanded
      >
        <ChecklistItem title="Sign up for LangSmith" status="completed" />
        <ChecklistItem
          key={path}
          title={
            path === 'Build an agent'
              ? 'Create your first agent'
              : 'Connect your first agent'
          }
          status={built ? 'completed' : 'pending'}
          defaultExpanded={!built}
        >
          <div className="flex flex-col items-start gap-space-3">
            <Text as="p" variant="sm" color="secondary">
              Describe what your agent should do and pick its tools. No code
              needed.
            </Text>
            <Button onClick={() => setBuilt(true)}>
              {built
                ? 'Open agent'
                : path === 'Build an agent'
                  ? 'Start building'
                  : 'Connect agent'}
            </Button>
          </div>
        </ChecklistItem>
        <ChecklistItem title="Test your agent">
          <Button>Run a test</Button>
        </ChecklistItem>
        <ChecklistItem title="See how your agent is doing" status="completed" />
      </ChecklistSection>
      <ChecklistSection
        title="Get More"
        description={
          built
            ? 'Keep exploring your agent'
            : 'Unlocks after you build your agent'
        }
        steps={[false, false, false, false, false]}
        defaultExpanded
      >
        {[
          'Edit your agent',
          'Look at your first trace',
          'Put your agent on a schedule or trigger',
          'Connect a tool',
          'Ask LangSmith from Slack',
        ].map((title) => (
          <ChecklistItem
            key={title}
            title={title}
            status={built ? 'pending' : 'locked'}
          >
            <Button size="sm">Get started</Button>
          </ChecklistItem>
        ))}
      </ChecklistSection>
    </Checklist>
  );
}

export const Grouped: Story = { render: () => <GroupedChecklist /> };
export const Narrow: Story = {
  render: () => <GroupedChecklist />,
  decorators: [
    (Story) => (
      <div className="w-64 max-w-full">
        <Story />
      </div>
    ),
  ],
};
export const Complete: Story = {
  args: { title: 'You’re all set', completed: 2, total: 2 },
  render: (args) => (
    <Checklist {...args}>
      <ChecklistItem title="Connect a repository" status="completed" />
      <ChecklistItem title="Invite your team" status="completed" />
    </Checklist>
  ),
};
export const Empty: Story = {
  args: {
    completed: 0,
    total: 0,
    children: (
      <Text variant="sm" color="tertiary" className="p-space-2">
        No tasks yet.
      </Text>
    ),
  },
};
export const Loading: Story = {
  args: {
    completed: 0,
    total: 0,
    children: (
      <div
        role="status"
        aria-label="Loading checklist"
        aria-busy="true"
        className="flex flex-col gap-space-3 p-space-2"
      >
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ),
  },
};
export const Error: Story = {
  args: {
    completed: 0,
    total: 0,
    children: <Banner intent="error">Could not load tasks. Try again.</Banner>,
  },
};
export const Disabled: Story = {
  args: {
    completed: 0,
    total: 1,
    children: (
      <ChecklistItem title="Connect a repository" disabled defaultExpanded>
        <Button>Connect</Button>
      </ChecklistItem>
    ),
  },
};
