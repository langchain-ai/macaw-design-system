import { useState } from 'react';

import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { UserPlusIcon } from '@phosphor-icons/react/dist/ssr/UserPlus';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Accordion, AccordionItem } from '.';
import { PlusIcon } from '../../icons/PaddedPhosphorIcons';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { Select, type SelectOption } from '../Select';
import { StatusBadge } from '../StatusBadge';
import { Switch } from '../Switch';
import { Text } from '../Text';

type Role = 'admin' | 'editor' | 'viewer';

const ROLES: SelectOption<Role>[] = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Manages members and billing',
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Creates and edits resources',
  },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

function RoleSelect({
  label,
  initial,
  disabled,
}: {
  label: string;
  initial: Role;
  disabled?: boolean;
}) {
  const [value, setValue] = useState<Role>(initial);
  return (
    <Select<Role>
      variant="plain"
      size="xs"
      value={value}
      onChange={(next) => {
        if (next) setValue(next);
      }}
      options={ROLES}
      aria-label={label}
      disabled={disabled}
      align="end"
      contentClassName="w-64"
    />
  );
}

const noop = () => {};

function SettingSwitch({
  label,
  description,
  initial,
}: {
  label: string;
  description: string;
  initial: boolean;
}) {
  const [checked, setChecked] = useState(initial);
  return (
    <div className="flex items-center justify-between gap-space-3">
      <span className="flex min-w-0 flex-col">
        <Text as="span" variant="sm" className="text-primary">
          {label}
        </Text>
        <Text as="span" variant="xs" color="tertiary">
          {description}
        </Text>
      </span>
      <Switch checked={checked} onChange={setChecked} aria-label={label} />
    </div>
  );
}

const meta: Meta<typeof AccordionItem> = {
  title: 'Components/Layout/Accordion',
  component: AccordionItem,
  subcomponents: { Accordion },
  parameters: {
    layout: 'centered',
  },
  tags: [
    'autodocs',
    'accordion',
    'expandable',
    'collapsible',
    'disclosure',
    'list',
    'settings',
  ],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    defaultExpanded: { control: 'boolean' },
    icon: { control: false },
    action: { control: false },
    badge: { control: false },
    menuItems: { control: false },
    contents: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-[36rem] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** An item expands to whatever its `contents` render. */
export const Default: Story = {
  args: {
    title: 'Notifications',
    description: 'Choose how you hear about activity',
    defaultExpanded: true,
  },
  render: (args) => (
    <Accordion>
      <AccordionItem
        {...args}
        icon={<BellIcon aria-hidden size={16} weight="regular" />}
        contents={
          <div className="flex flex-col gap-space-3">
            <SettingSwitch
              label="Email"
              description="A daily summary of activity"
              initial
            />
            <SettingSwitch
              label="Push"
              description="Mentions and direct messages"
              initial={false}
            />
          </div>
        }
      />
    </Accordion>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Accordion
      title="Members"
      description="People who can access this workspace."
      action={
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          leftDecorator={UserPlusIcon}
        >
          Invite
        </Button>
      }
    >
      <AccordionItem
        avatar="Dana Whitfield"
        title="Dana Whitfield"
        description="dana@example.com"
        badge={<StatusBadge>Owner</StatusBadge>}
        action={
          <RoleSelect label="Dana Whitfield's role" initial="admin" disabled />
        }
      />
      <AccordionItem
        avatar="Sam Ortega"
        title="Sam Ortega"
        description="sam@example.com"
        action={<RoleSelect label="Sam Ortega's role" initial="editor" />}
        menuItems={[
          {
            label: 'Remove',
            description: 'Revokes access to this workspace',
            onSelect: noop,
            tone: 'destructive',
          },
        ]}
      />
      <AccordionItem
        avatar="Priya Nair"
        title="Priya Nair"
        description="priya@example.com"
        badge={<StatusBadge variant="warning">Invite pending</StatusBadge>}
        action={<RoleSelect label="Priya Nair's role" initial="viewer" />}
        menuItems={[
          {
            label: 'Resend Invite',
            description: 'Emails a new invite link',
            onSelect: noop,
          },
          { label: 'Revoke Invite', onSelect: noop, tone: 'destructive' },
        ]}
      />
    </Accordion>
  ),
};

/** An item without contents doesn't expand; its action stays on the header. */
export const WithoutContents: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(true);
    return (
      <Accordion>
        <AccordionItem
          title="Sync automatically"
          description="Keep files up to date"
          action={
            <Switch
              checked={enabled}
              onChange={setEnabled}
              aria-label="Sync automatically"
            />
          }
        />
      </Accordion>
    );
  },
};

export const WithMenuItemsAndBadges: Story = {
  render: () => (
    <Accordion>
      <AccordionItem
        icon={<KeyIcon aria-hidden size={16} weight="regular" />}
        title="Production key"
        description="Last used 2 hours ago"
        badge={<StatusBadge variant="success">Active</StatusBadge>}
        menuItems={[
          { label: 'Rename', onSelect: noop },
          {
            label: 'Rotate',
            description: 'Available once the key is a day old',
            onSelect: noop,
            disabled: true,
          },
          {
            label: 'Revoke',
            description: 'Requests with this key start failing',
            onSelect: noop,
            tone: 'destructive',
          },
        ]}
        contents={
          <Text as="p" variant="sm" color="secondary">
            Created on March 3 by Dana Whitfield. Grants read and write access.
          </Text>
        }
      />
      <AccordionItem
        icon={<KeyIcon aria-hidden size={16} weight="regular" />}
        title="CI key"
        description="Last used 5 days ago"
        badge={<StatusBadge variant="warning">Expires in 3 days</StatusBadge>}
        menuItems={[{ label: 'Revoke', onSelect: noop, tone: 'destructive' }]}
      />
    </Accordion>
  ),
};

/**
 * Every trailing control (action, menu, and caret) centers on the icon tile's
 * axis, and the last one sits as far from the card's right edge as the tile
 * does from its left, with or without a description.
 */
export const TrailingAlignment: Story = {
  render: () => {
    const [sync, setSync] = useState(true);
    return (
      <Accordion>
        <AccordionItem
          icon={<BellIcon aria-hidden size={16} weight="regular" />}
          title="Notifications"
          description="Choose how you hear about activity"
          contents={
            <Text as="p" variant="sm" color="secondary">
              Email and push settings.
            </Text>
          }
        />
        <AccordionItem
          icon={<BellIcon aria-hidden size={16} weight="regular" />}
          title="Digest"
          contents={
            <Text as="p" variant="sm" color="secondary">
              A weekly summary.
            </Text>
          }
        />
        <AccordionItem
          icon={<GlobeIcon aria-hidden size={16} weight="regular" />}
          title="Sync automatically"
          description="Keep files up to date"
          action={
            <Switch
              checked={sync}
              onChange={setSync}
              aria-label="Sync automatically"
            />
          }
        />
        <AccordionItem
          icon={<KeyIcon aria-hidden size={16} weight="regular" />}
          title="Production key"
          description="Last used 2 hours ago"
          menuItems={[{ label: 'Rename', onSelect: noop }]}
        />
        <AccordionItem
          avatar="Sam Ortega"
          title="Sam Ortega"
          description="sam@example.com"
          action={<RoleSelect label="Sam Ortega's role" initial="editor" />}
          menuItems={[{ label: 'Remove', onSelect: noop, tone: 'destructive' }]}
          contents={
            <Text as="p" variant="sm" color="secondary">
              Joined on March 3.
            </Text>
          }
        />
      </Accordion>
    );
  },
};

/**
 * An empty list puts an `EmptyState` in the card, with its own call to action
 * beside the header's.
 */
export const EmptyWithCallToAction: Story = {
  render: () => (
    <Accordion
      title="Members"
      description="People who can access this workspace."
      action={
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          leftDecorator={UserPlusIcon}
        >
          Invite
        </Button>
      }
    >
      <EmptyState
        icon={UsersIcon}
        iconWeight="regular"
        title="No members yet"
        description="Invite teammates to share projects and settings in this workspace."
        action={
          <Button
            size="sm"
            variant="outlined"
            color="secondary"
            leftDecorator={PlusIcon}
          >
            Invite Member
          </Button>
        }
        className="px-space-4 py-space-8"
      />
    </Accordion>
  ),
};
