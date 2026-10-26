import { useState } from 'react';

import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { UserPlusIcon } from '@phosphor-icons/react/dist/ssr/UserPlus';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Accordion, AccordionItem } from '.';
import { Button } from '../Button';
import { DropdownMenuItem } from '../DropdownMenu';
import { InlineSelect } from '../InlineSelect';
import { StatusBadge } from '../StatusBadge';
import { Switch } from '../Switch';
import { Text } from '../Text';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
] as const;
type Role = (typeof ROLES)[number]['value'];

function RoleSelect({ label, initial }: { label: string; initial: Role }) {
  const [value, setValue] = useState<Role>(initial);
  return (
    <InlineSelect<Role>
      value={value}
      onChange={setValue}
      options={ROLES}
      aria-label={label}
    />
  );
}

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
        action={<RoleSelect label="Dana Whitfield's role" initial="admin" />}
      />
      <AccordionItem
        avatar="Sam Ortega"
        title="Sam Ortega"
        description="sam@example.com"
        action={<RoleSelect label="Sam Ortega's role" initial="editor" />}
        menuItems={<DropdownMenuItem>Remove</DropdownMenuItem>}
      />
      <AccordionItem
        avatar="Priya Nair"
        title="Priya Nair"
        description="priya@example.com"
        badge={<StatusBadge variant="warning">Invite pending</StatusBadge>}
        action={<RoleSelect label="Priya Nair's role" initial="viewer" />}
        menuItems={
          <>
            <DropdownMenuItem>Resend invite</DropdownMenuItem>
            <DropdownMenuItem>Revoke invite</DropdownMenuItem>
          </>
        }
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
        menuItems={
          <>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Revoke</DropdownMenuItem>
          </>
        }
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
        menuItems={<DropdownMenuItem>Revoke</DropdownMenuItem>}
      />
    </Accordion>
  ),
};

/** The list's empty state sits inside the card. */
export const Empty: Story = {
  render: () => (
    <Accordion title="Members">
      <AccordionItem
        title="No members yet"
        description="Invite someone to share this workspace."
      />
    </Accordion>
  ),
};
