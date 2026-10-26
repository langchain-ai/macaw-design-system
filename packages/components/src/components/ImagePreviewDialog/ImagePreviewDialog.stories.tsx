import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImagePreviewDialog } from '.';
import sampleImage from '../../stories/assets/attachment-preview.png';
import { Attachment } from '../Attachment';
import { Button } from '../Button';

const meta = {
  title: 'Components/Display/ImagePreviewDialog',
  component: ImagePreviewDialog,
  tags: ['autodocs', 'image', 'preview', 'dialog', 'zoom', 'pan', 'attachment'],
  parameters: {
    docs: {
      description: {
        component:
          'A shared image viewer with zoom, fit, scroll and drag panning. A visible title and host-owned download are optional.',
      },
    },
  },
  args: {
    open: false,
    onOpenChange: () => {},
    src: sampleImage,
    alt: 'Engine workflow illustration',
  },
  render: function PreviewExample(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button color="secondary" onClick={() => setOpen(true)}>
          Preview image
        </Button>
        <ImagePreviewDialog {...args} open={open} onOpenChange={setOpen} />
      </>
    );
  },
} satisfies Meta<typeof ImagePreviewDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongTitle: Story = {
  args: {
    title:
      'Engine Workflow — Complete Architecture, Execution History, Tool Results, Evaluation Results, and Deployment Configuration for the Current Workspace',
    onDownload: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'The title and controls share one row. Resize the dialog and hover or focus a truncated title to read its full name.',
      },
    },
  },
};
export const WithDownload: Story = {
  render: function DownloadExample(args) {
    const [open, setOpen] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    return (
      <>
        <Button color="secondary" onClick={() => setOpen(true)}>
          Preview image
        </Button>
        <output>{downloaded ? 'Download callback invoked.' : ''}</output>
        <ImagePreviewDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          onDownload={() => setDownloaded(true)}
        />
      </>
    );
  },
};
export const FromAttachment: Story = {
  render: function AttachmentExample(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Attachment
          name="workflow.png"
          className="w-64 max-w-full"
          contentType="image/png"
          preview={<img src={sampleImage} alt="" />}
          onOpen={() => setOpen(true)}
        />
        <ImagePreviewDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="workflow.png"
        />
      </>
    );
  },
};
export const UnavailableImage: Story = {
  args: { src: 'data:image/png;base64,invalid' },
};
