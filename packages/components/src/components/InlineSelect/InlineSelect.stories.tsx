import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { InlineSelect, type InlineSelectOption } from '.';

type Role = 'admin' | 'editor' | 'viewer';

const ROLES: InlineSelectOption<Role>[] = [
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

const meta = {
  title: 'Components/Inputs/InlineSelect',
  component: InlineSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs', 'select', 'inline', 'dropdown', 'settings', 'picker'],
  args: {
    value: 'editor',
    onChange: () => {},
    options: ROLES,
    'aria-label': 'Role',
  },
} satisfies Meta<typeof InlineSelect<Role>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Change the value from the menu. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Role>('editor');
    return (
      <InlineSelect
        value={value}
        onChange={setValue}
        options={ROLES}
        aria-label="Role"
      />
    );
  },
};

/** On its default, the trigger says so; changed, it doesn't. */
export const WithDefault: Story = {
  render: () => {
    const [value, setValue] = useState<Role>('viewer');
    return (
      <InlineSelect
        value={value}
        defaultValue="viewer"
        onChange={setValue}
        options={ROLES}
        aria-label="New member role"
      />
    );
  },
};

/** Turned off, such as for a viewer without permission to change it. */
export const Disabled: Story = {
  render: () => (
    <InlineSelect
      value="admin"
      onChange={() => {}}
      options={ROLES}
      aria-label="Owner role"
      disabled
    />
  ),
};
