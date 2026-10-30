import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImagePreviewBlock } from '.';
import sampleImage from '../../stories/assets/attachment-preview.png';
import { sanitizeImageSrc } from '../../utils/sanitizeImageSrc';
import { Button } from '../Button';
import engineLogo from '../Logo/EngineLogoLight.svg';
import fleetLogo from '../Logo/FleetLogoFull.svg';

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
          '- Image block with optional caption and actions.',
          '- Opens a zoomable preview titled by the caption, with optional download.',
          '- Shrinks to fit without upscaling.',
          '- Hosts manage sources, downloads, and permissions.',
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
    altText: 'Engine workflow illustration',
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

export const MultipleImages: Story = {
  render: (args) => (
    <div className="flex flex-col gap-space-3">
      <ImagePreviewBlock
        src={engineLogo}
        altText="LangSmith Engine logo"
        caption="LangSmith Engine"
      />
      <ImagePreviewBlock {...args} />
      <ImagePreviewBlock
        src={fleetLogo}
        altText="LangSmith Fleet logo"
        caption="LangSmith Fleet"
      />
    </div>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <ImagePreviewBlock
      {...args}
      actions={
        <Button
          size="xs"
          color="secondary"
          variant="plain"
          leftDecorator={DownloadSimpleIcon}
          onClick={() => {
            const link = document.createElement('a');
            link.href = sanitizeImageSrc(args.src);
            link.download = 'image.png';
            document.body.appendChild(link);
            link.click();
            link.remove();
          }}
        >
          Download image
        </Button>
      }
    />
  ),
};

export const Narrow: Story = {
  render: (args) => (
    <div className="w-64 max-w-full">
      <ImagePreviewBlock {...args} />
    </div>
  ),
};
