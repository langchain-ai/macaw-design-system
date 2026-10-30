import { useState } from 'react';

import { fn } from 'storybook/test';

import { EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ChatConversationList,
  ChatConversationListGroup,
  ChatConversationListItem,
  type ChatConversationListProps,
} from '.';
import { Button } from '../Button';
import { DropdownMenuItem } from '../DropdownMenu';
import { Spinner } from '../Spinner';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';

const onRename = fn().mockName('onRename');
const onDelete = fn().mockName('onDelete');
const onMarkRead = fn().mockName('onMarkRead');

const meta = {
  title: 'Components/Chat/ChatConversationList',
  component: ChatConversationList,
  parameters: {
    a11y: { test: 'error' },
    layout: 'centered',
    docs: {
      description: {
        component: `Compact conversation list with keyboard navigation.

- **Rows:** Title, indicator, and hover/focus actions. Both stay visible on touch.
- **Menus:** Rename, Pin/Unpin, Delete; customize with \`actions.items\`.
- **Groups:** One level of collapsible folders, with Rename/Delete actions.
- **Keyboard:** Up/Down and Home/End move focus; Enter/Space activate; Tab reaches actions.
- **States:** Standard loading skeletons, automatic empty state, and optional error content.
- **Host-owned:** Data, selection, routing, pagination, mutations, and optional tooltips.`,
      },
    },
  },
  tags: [
    'autodocs',
    'a11y-test',
    'chat',
    'conversation',
    'list',
    'sidebar',
    'navigation',
    'unread',
    'attention',
    'folder',
    'group',
    'collapsible',
  ],
  args: { 'aria-label': 'Conversations', loading: false },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full bg-surface-level-1">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatConversationList>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveList(props: ChatConversationListProps) {
  const [selected, setSelected] = useState('planning');
  const [pinned, setPinned] = useState(false);

  return (
    <ChatConversationList {...props}>
      <ChatConversationListItem
        title="Release planning"
        selected={selected === 'planning'}
        onClick={() => setSelected('planning')}
        actions={{
          pinned,
          onRename,
          onTogglePin: () => setPinned(!pinned),
          onDelete,
        }}
      />
      <ChatConversationListItem
        title="Research summary"
        unread
        selected={selected === 'research'}
        onClick={() => setSelected('research')}
      />
      <ChatConversationListItem title="Unavailable conversation" disabled />
    </ChatConversationList>
  );
}

export const Default: Story = {
  render: (args) => <InteractiveList {...args} />,
};

function GroupsExample() {
  const [open, setOpen] = useState(true);

  return (
    <ChatConversationList
      aria-label="Conversations by folder"
      footer={
        <Button
          variant="plain"
          color="secondary"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Collapse folder' : 'Expand folder'}
        </Button>
      }
    >
      <ChatConversationListGroup
        title="Design system"
        open={open}
        onOpenChange={setOpen}
        actions={{ onRename, onDelete }}
      >
        <ChatConversationListItem title="Chat components" selected />
        <ChatConversationListItem title="Review token mismatches" unread />
      </ChatConversationListGroup>
      <ChatConversationListGroup title="Frontend">
        <ChatConversationListItem title="Composer improvements" />
      </ChatConversationListGroup>
      <ChatConversationListItem title="Release planning" />
      <ChatConversationListGroup
        title="Unavailable folder"
        disabled
        actions={{}}
      />
    </ChatConversationList>
  );
}

export const Groups: Story = {
  render: () => <GroupsExample />,
};

export const CustomActions: Story = {
  render: () => (
    <ChatConversationList aria-label="Conversations with custom actions">
      <ChatConversationListItem
        title="Research summary"
        unread
        actions={{
          items: (
            <DropdownMenuItem
              size="sm"
              className="gap-space-2"
              onSelect={onMarkRead}
            >
              <EnvelopeIcon size={16} weight="regular" aria-hidden />
              Mark as read
            </DropdownMenuItem>
          ),
        }}
      />
    </ChatConversationList>
  ),
};

const LONG_TITLE =
  'Release planning and final checklist for the upcoming launch';

export const HostTooltip: Story = {
  render: () => (
    <ChatConversationList aria-label="Conversations with host-owned details">
      <Tooltip
        title={LONG_TITLE}
        description={
          <time dateTime="2026-09-30T09:42:00">Sep 30 at 9:42 AM</time>
        }
        side="right"
        disableHoverableContent={false}
      >
        <ChatConversationListItem
          title={LONG_TITLE}
          actions={{ onRename, onDelete }}
        />
      </Tooltip>
    </ChatConversationList>
  ),
};

export const Indicators: Story = {
  render: () => (
    <ChatConversationList aria-label="Conversation states">
      <ChatConversationListItem title="Unread update" unread />
      <ChatConversationListItem
        title="Approval needed"
        unread
        indicator={
          <span className="inline-flex text-warning-secondary">
            <WarningCircleIcon size={16} weight="regular" aria-hidden />
            <span className="sr-only">Attention required</span>
          </span>
        }
      />
      <ChatConversationListItem
        title="Generating summary"
        unread
        indicator={
          <span className="inline-flex items-center text-tertiary">
            <Spinner size="xs" className="motion-reduce:animate-none" />
            <span className="sr-only">Running</span>
          </span>
        }
      />
    </ChatConversationList>
  ),
};

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = {};

export const WithError: Story = {
  name: 'Error',
  args: {
    errorContent: (
      <Text variant="sm">Could not load conversations. Please try again.</Text>
    ),
  },
};

export const Narrow: Story = {
  render: () => (
    <div className="w-56">
      <ChatConversationList aria-label="Conversations">
        <ChatConversationListItem
          title="A conversation with a very long title that should truncate"
          selected
          unread
          actions={{ onRename }}
        />
      </ChatConversationList>
    </div>
  ),
};

function PaginatedList() {
  const [count, setCount] = useState(2);

  return (
    <ChatConversationList
      aria-label="Conversations"
      footer={
        <div className="flex justify-center py-space-2">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCount(count + 2)}
          >
            Load more
          </Button>
        </div>
      }
    >
      {Array.from({ length: count }, (_, index) => (
        <ChatConversationListItem
          key={index}
          title={`Conversation ${index + 1}`}
        />
      ))}
    </ChatConversationList>
  );
}

export const HostPagination: Story = { render: () => <PaginatedList /> };
