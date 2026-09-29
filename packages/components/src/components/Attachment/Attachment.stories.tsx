import { useState } from 'react';

import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { FileCodeIcon } from '@phosphor-icons/react/dist/ssr/FileCode';
import { PencilIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Attachment, AttachmentList, type AttachmentProps } from '.';
import sampleImage from '../../stories/assets/attachment-preview.png';
import { Button } from '../Button';
import { Dialog, DialogContent } from '../Dialog';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { Text } from '../Text';

const meta = {
  title: 'Components/Display/Attachment',
  component: Attachment,
  tags: [
    'autodocs',
    'attachment',
    'file',
    'upload',
    'thumbnail',
    'preview',
    'chat',
    'download',
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'File cards and image thumbnails with optional metadata and actions. Long names truncate from the start to keep extensions visible. Group them with `AttachmentList` using wrap, scroll or stack layouts.',
          'Consumers handle uploads, safe previews, object URL cleanup and file operations. Use `onRemove` for drafts; confirm persisted deletion through `actions`.',
        ].join('\n\n'),
      },
    },
  },
  args: {
    name: 'report.pdf',
    contentType: 'application/pdf',
    metadata: '7MB',
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Attachment>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: {
  size: NonNullable<AttachmentProps['size']>;
  label: string;
}[] = [
  { size: 'sm', label: 'Small 24px' },
  { size: 'md', label: 'Medium 32px' },
  { size: 'lg', label: 'Large 48px' },
];

export const Default: Story = {};

export const SizesAndStates: Story = {
  render: (args) => (
    <div className="flex flex-col gap-space-4">
      {sizes.map(({ size, label }) => (
        <div key={size} className="flex flex-col gap-space-2">
          <Text variant="xs" color="secondary">
            {label}
          </Text>
          <AttachmentList layout="stack">
            <Attachment {...args} size={size} onRemove={() => {}} />
            <Attachment
              {...args}
              name="reference.png"
              contentType="image/png"
              size={size}
              preview={<img src={sampleImage} alt="" />}
              metadata="340KB"
              onRemove={() => {}}
            />
            <Attachment {...args} size={size} status="loading" />
            <Attachment
              {...args}
              size={size}
              status="uploading"
              onRemove={() => {}}
            />
            <Attachment
              {...args}
              size={size}
              status="error"
              onRemove={() => {}}
            />
          </AttachmentList>
        </div>
      ))}
    </div>
  ),
};

export const Thumbnails: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-space-4">
      {sizes.map(({ size }) => (
        <div key={size} className="flex min-w-0 flex-col gap-space-2">
          <Text variant="xs" color="secondary">
            {size}
          </Text>
          <AttachmentList layout="stack">
            <Attachment
              name={`${size}-preview.png`}
              variant="thumbnail"
              size={size}
              preview={<img src={sampleImage} alt="" />}
              metadata="340KB"
              onRemove={() => {}}
            />
            <Attachment
              name={`${size}-uploading.png`}
              variant="thumbnail"
              size={size}
              contentType="image/png"
              preview={<img src={sampleImage} alt="" />}
              status="uploading"
              onRemove={() => {}}
            />
            <Attachment
              name={`${size}-failed.png`}
              variant="thumbnail"
              size={size}
              contentType="image/png"
              preview={<img src={sampleImage} alt="" />}
              status="error"
              onRemove={() => {}}
            />
          </AttachmentList>
        </div>
      ))}
    </div>
  ),
};

export const FileTypes: Story = {
  render: () => (
    <AttachmentList>
      {[
        { name: 'photo.png', contentType: 'image/png' },
        { name: 'recording.mp3', contentType: 'audio/mpeg' },
        { name: 'video.mp4', contentType: 'video/mp4' },
        { name: 'page.html', contentType: 'text/html' },
        { name: 'notes.txt', contentType: 'text/plain' },
        { name: 'results.csv', contentType: 'text/csv' },
        { name: 'report.pdf', contentType: 'application/pdf' },
        { name: 'trace.json', contentType: 'application/json' },
        { name: 'archive.zip', contentType: 'application/zip' },
        { name: 'unknown', contentType: null },
      ].map((file) => (
        <Attachment key={file.name} {...file} onRemove={() => {}} />
      ))}
      <Attachment
        name="script.ts"
        contentType="text/plain"
        icon={FileCodeIcon}
        metadata="2KB"
      />
    </AttachmentList>
  ),
};

function ComposerAttachmentsDemo() {
  const [files, setFiles] = useState(['instructions.md', 'reference.png']);
  return (
    <AttachmentList>
      {files.map((name) => (
        <Attachment
          key={name}
          name={name}
          size="sm"
          preview={
            name.endsWith('.png') ? <img src={sampleImage} alt="" /> : undefined
          }
          onRemove={() =>
            setFiles((current) => current.filter((file) => file !== name))
          }
        />
      ))}
    </AttachmentList>
  );
}

function FileActionsDemo() {
  const [name, setName] = useState('reference.png');
  const [draftName, setDraftName] = useState(name);
  const [dialog, setDialog] = useState<'preview' | 'rename' | 'delete' | null>(
    null
  );
  const [renameError, setRenameError] = useState('');
  const [removed, setRemoved] = useState(false);
  const [notice, setNotice] = useState('');

  return (
    <div className="flex min-w-0 flex-col gap-space-3">
      {removed ? (
        <Button color="secondary" onClick={() => setRemoved(false)}>
          Restore example
        </Button>
      ) : (
        <Attachment
          name={name}
          size="lg"
          metadata="340KB"
          preview={<img src={sampleImage} alt="" />}
          onOpen={() => setDialog('preview')}
          actions={
            <>
              <IconButton
                type="button"
                icon={ArrowSquareOutIcon}
                iconWeight="regular"
                label="Open in new tab"
                color="secondary"
                variant="plain"
                onClick={() =>
                  setNotice(
                    'New-tab callback invoked. This example does not navigate.'
                  )
                }
              />
              <IconButton
                type="button"
                icon={DownloadSimpleIcon}
                iconWeight="regular"
                label="Download"
                color="secondary"
                variant="plain"
                onClick={() =>
                  setNotice(
                    'Download callback invoked. This example does not fetch a file.'
                  )
                }
              />
              <IconButton
                type="button"
                icon={PencilIcon}
                iconWeight="regular"
                label="Rename"
                color="secondary"
                variant="plain"
                onClick={() => {
                  setDraftName(name);
                  setRenameError('');
                  setDialog('rename');
                }}
              />
              <IconButton
                type="button"
                icon={TrashIcon}
                iconWeight="regular"
                label="Delete"
                color="secondary"
                variant="plain"
                onClick={() => setDialog('delete')}
              />
            </>
          }
        />
      )}
      <Text variant="xs" color="secondary" role="status">
        {notice}
      </Text>
      <Dialog
        open={dialog === 'preview'}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent title={name}>
          <img
            src={sampleImage}
            alt={name}
            className="max-h-96 w-full object-contain"
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === 'rename'}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent title="Rename Attachment">
          <form
            className="flex flex-col gap-space-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draftName.trim()) {
                setRenameError('Enter a filename.');
                return;
              }
              setName(draftName);
              setDialog(null);
              setNotice('Attachment renamed.');
            }}
          >
            <Input
              aria-label="Attachment name"
              value={draftName}
              onChange={setDraftName}
              isError={!!renameError}
              hintText={renameError || undefined}
            />
            <div className="flex justify-end gap-space-2">
              <Button
                type="button"
                color="secondary"
                onClick={() => setDialog(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === 'delete'}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent title="Delete Attachment">
          <div className="flex flex-col gap-space-4">
            <Text variant="sm">Delete {name} from this example?</Text>
            <div className="flex justify-end gap-space-2">
              <Button color="secondary" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                color="error"
                onClick={() => {
                  setRemoved(true);
                  setDialog(null);
                  setNotice('Attachment deleted after confirmation.');
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ThumbnailsDemo() {
  const [files, setFiles] = useState([
    'reference.png',
    'very-long-image-filename-for-the-design-review.png',
  ]);
  const [selected, setSelected] = useState<string>();
  return (
    <>
      <AttachmentList>
        {files.map((name) => (
          <Attachment
            key={name}
            name={name}
            variant="thumbnail"
            preview={<img src={sampleImage} alt="" />}
            onOpen={() => setSelected(name)}
            onRemove={() =>
              setFiles((current) => current.filter((file) => file !== name))
            }
          />
        ))}
      </AttachmentList>
      <Dialog
        open={selected !== undefined}
        onOpenChange={(open) => !open && setSelected(undefined)}
      >
        <DialogContent title={selected ?? 'Image preview'}>
          <img
            src={sampleImage}
            alt={selected ?? ''}
            className="max-h-96 w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export const PreviewAndActions: Story = {
  render: () => (
    <div className="flex flex-col gap-space-5">
      <div className="flex flex-col gap-space-2">
        <Text as="h3" variant="sm" weight="medium">
          File actions
        </Text>
        <FileActionsDemo />
      </div>
      <div className="flex flex-col gap-space-2">
        <Text as="h3" variant="sm" weight="medium">
          Image previews and removal
        </Text>
        <ThumbnailsDemo />
      </div>
    </div>
  ),
};

export const Layouts: Story = {
  render: () => (
    <div className="flex flex-col gap-space-5">
      <div className="flex flex-col gap-space-2">
        <Text as="h3" variant="sm" weight="medium">
          Wrapping and removal
        </Text>
        <ComposerAttachmentsDemo />
      </div>
      <div className="flex w-80 max-w-full flex-col gap-space-2">
        <Text as="h3" variant="sm" weight="medium">
          Horizontal scrolling
        </Text>
        <AttachmentList layout="scroll">
          {[
            'report.pdf',
            'instructions.md',
            'reference.png',
            'results.csv',
          ].map((name) => (
            <Attachment key={name} name={name} size="sm" />
          ))}
        </AttachmentList>
      </div>
      <div className="flex w-64 max-w-full flex-col gap-space-2">
        <Text as="h3" variant="sm" weight="medium">
          Narrow surface
        </Text>
        <FileActionsDemo />
        <Attachment
          name="experiment-results-with-a-very-long-filename.csv"
          status="error"
        />
      </div>
    </div>
  ),
};
