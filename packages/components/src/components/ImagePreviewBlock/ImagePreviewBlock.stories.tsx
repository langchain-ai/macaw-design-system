import { useState } from 'react';

import { sanitizeUrl } from '@braintree/sanitize-url';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImagePreviewBlock } from '.';
import sampleImage from '../../stories/assets/attachment-preview.png';
import { Button } from '../Button';
import engineLogo from '../Logo/EngineLogoLight.svg';
import fleetLogo from '../Logo/FleetLogoFull.svg';

function downloadImage() {
  const link = document.createElement('a');
  link.href = sanitizeUrl(sampleImage);
  link.download = 'engine-workflow.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const meta = {
  title: 'Components/Display/ImagePreviewBlock',
  component: ImagePreviewBlock,
  tags: ['autodocs', 'image', 'preview', 'zoom', 'caption', 'actions'],
  parameters: {
    layout: 'centered',
    docs: {
      source: { type: 'code' },
      description: {
        component: [
          '- One image with an optional caption and host-owned actions.',
          '- Click to open ImagePreviewDialog with zoom, fit, and panning.',
          '- The preview title is hidden unless previewTitle is supplied; download is optional.',
          '- Images retain their natural dimensions and shrink to fit narrow containers.',
          '- Hosts own image sources, URL lifecycles, downloads, and permissions.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[min(640px,calc(100vw-48px))]">
        <Story />
      </div>
    ),
  ],
  args: {
    src: sampleImage,
    alt: 'Engine workflow illustration',
    caption: 'Engine workflow illustration',
  },
  argTypes: {
    actions: { control: false },
    onDownload: { control: false },
  },
} satisfies Meta<typeof ImagePreviewBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPreviewTitle: Story = {
  args: { previewTitle: 'Engine Workflow' },
};

export const WithDownload: Story = {
  args: { onDownload: downloadImage },
};

export const MultipleImages: Story = {
  render: (args) => (
    <div className="flex flex-col gap-space-3">
      <ImagePreviewBlock
        src={engineLogo}
        alt="LangSmith Engine logo"
        caption="LangSmith Engine"
      />
      <ImagePreviewBlock {...args} />
      <ImagePreviewBlock
        src={fleetLogo}
        alt="LangSmith Fleet logo"
        caption="LangSmith Fleet"
      />
    </div>
  ),
};

export const WithActions: Story = {
  render: function WithActionsExample(args) {
    const [saved, setSaved] = useState(false);
    return (
      <ImagePreviewBlock
        {...args}
        actions={
          <Button
            size="sm"
            color="secondary"
            variant="outlined"
            disabled={saved}
            onClick={() => setSaved(true)}
          >
            {saved ? 'Saved' : 'Save image'}
          </Button>
        }
      />
    );
  },
};

export const Narrow: Story = {
  render: (args) => (
    <div className="w-64 max-w-full">
      <ImagePreviewBlock
        {...args}
        previewTitle="Engine Workflow With a Longer Title"
      />
    </div>
  ),
};

export const UnavailableImage: Story = {
  args: {
    src: 'data:image/png;base64,invalid',
    alt: 'Unavailable workflow image',
  },
  parameters: {
    docs: {
      description: {
        story: 'Open the preview to see the image-load error state.',
      },
    },
  },
};
