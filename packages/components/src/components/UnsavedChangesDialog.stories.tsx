import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';
import UnsavedChangesDialog from './UnsavedChangesDialog';

const meta = {
  title: 'Components/Layout/UnsavedChangesDialog',
  component: UnsavedChangesDialog,
  tags: ['autodocs', 'dirty form', 'leave page', 'discard changes'],
  parameters: { layout: 'centered' },
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Save your changes?',
    description:
      'You have unsaved changes. Save them before leaving this page.',
  },
} satisfies Meta<typeof UnsavedChangesDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Leave page</Button>
        <UnsavedChangesDialog
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
          onDiscard={() => setIsOpen(false)}
        />
      </>
    );
  },
};
