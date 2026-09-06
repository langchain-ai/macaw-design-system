import { useState } from 'react';

import { FloppyDiskIcon } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '.';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Text } from '../Text/Text';

const meta = {
  title: 'Components/Layout/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Use for a short, focused modal task or decision. Prefer Popover for lightweight disclosure and Pane for larger workflows.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    open: false,
    onOpenChange: () => {},
    children: null,
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent title="Dialog title">
            <Text variant="sm" color="secondary">
              This is the dialog body. Put any content here.
            </Text>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            title="Dialog title"
            description="A short description that gives the user more context about what this dialog does."
          >
            <Text variant="sm" color="secondary">
              Dialog body content goes here.
            </Text>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithCustomHeader: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open custom dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent showClose={false} childrenClassName="gap-space-5">
            <div className="flex items-start justify-between gap-space-4">
              <div className="flex flex-col gap-space-1">
                <DialogTitle asChild>
                  <Text variant="h3" weight="semibold">
                    Custom dialog title
                  </Text>
                </DialogTitle>
                <DialogDescription asChild>
                  <Text variant="sm" color="quaternary">
                    Titles and descriptions remain accessible in custom layouts.
                  </Text>
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button color="secondary" size="sm">
                  Close
                </Button>
              </DialogClose>
            </div>
            <Text variant="sm" color="secondary">
              Dialog body content goes here.
            </Text>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open form dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            title="Create project"
            description="Create a project from scratch."
          >
            <div className="flex flex-col gap-space-3">
              <Input
                label="Project name"
                placeholder="Enter project name..."
                onChange={() => {}}
              />
              <Input
                label="Description"
                placeholder="Enter description..."
                onChange={() => {}}
              />
            </div>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithScrollableContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open long dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            title="Scrollable dialog"
            description="Long dialog content scrolls while the title remains visible."
          >
            {Array.from({ length: 20 }, (_, index) => (
              <Input
                key={index}
                label={`Field ${index + 1}`}
                placeholder="Enter a value..."
                onChange={() => {}}
              />
            ))}
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithoutClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog (no X button)</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent title="Confirm action" showClose={false}>
            <Text variant="sm" color="secondary">
              This dialog hides the close button, forcing the user to use the
              action buttons to dismiss it.
            </Text>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button color="error" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithIconError: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button color="error" onClick={() => setOpen(true)}>
          Delete item
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            title="Delete item"
            titleIcon={TrashIcon}
            titleIconIntent="error"
            className="w-100"
            showClose={false}
          >
            <Text variant="body" color="secondary">
              You have unsaved changes that will be lost if you leave.
            </Text>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button color="error" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithIconWarning: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button color="secondary" onClick={() => setOpen(true)}>
          Leave page
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            title="Unsaved changes"
            titleIcon={WarningCircleIcon}
            titleIconIntent="warning"
            className="w-100"
            showClose={false}
          >
            <Text variant="body" color="secondary">
              You have unsaved changes that will be lost if you leave.
            </Text>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Stay
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setOpen(false)}
              >
                Leave
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const WithIconInfo: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Save changes</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            title="Save changes"
            titleIcon={FloppyDiskIcon}
            titleIconIntent="info"
            className="w-100"
            showClose={false}
          >
            <Text variant="body" color="secondary">
              This is an example for an info variant.
            </Text>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

export const NoTitle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open titleless dialog</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent showClose={false} className="w-100">
            <Text variant="sm" color="secondary">
              A dialog without a title or close button.
            </Text>
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};
