import { useId, useState, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { sanitizeImageSrc } from '../../utils/sanitizeImageSrc';
import { Button } from '../Button';
import { ImagePreviewDialog } from '../ImagePreviewDialog';
import { Text } from '../Text';

export interface ImagePreviewBlockProps {
  src: string;
  altText: string;
  /** Also used as the preview's visible title. Omit to keep it hidden. */
  caption?: string;
  /** Accessible name for the preview button. Defaults to "Preview {altText}". */
  openLabel?: string;
  /** Hosts own download behavior and permissions. */
  onDownload?: () => void;
  /** Hosts own action behavior, permissions, and follow-up state. */
  actions?: ReactNode;
  className?: string;
}

export function ImagePreviewBlock({
  src,
  altText,
  caption,
  openLabel = `Preview ${altText || 'image'}`,
  onDownload,
  actions,
  className,
}: ImagePreviewBlockProps) {
  const captionId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-full flex-col gap-space-3 [overflow-wrap:anywhere]',
        className
      )}
    >
      <figure
        aria-labelledby={caption ? captionId : undefined}
        className="m-0 min-w-0"
      >
        <Button
          type="button"
          color="secondary"
          variant="plain"
          aria-label={openLabel}
          onClick={() => setOpen(true)}
          className="h-auto w-full min-w-0 whitespace-normal rounded-sm bg-surface-level-2 p-space-5 shadow-none"
        >
          <img
            src={sanitizeImageSrc(src)}
            alt={altText}
            className="block h-auto max-w-full"
          />
        </Button>
      </figure>
      {(caption || actions != null) && (
        <div className="flex flex-wrap items-center justify-end gap-space-3">
          {caption && (
            <Text
              id={captionId}
              variant="xs"
              color="quaternary"
              className="min-w-0 flex-1 basis-48"
            >
              {caption}
            </Text>
          )}
          {actions != null && (
            <div className="flex max-w-full flex-wrap items-center justify-end gap-space-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <ImagePreviewDialog
        open={open}
        onOpenChange={setOpen}
        src={src}
        altText={altText}
        title={caption}
        onDownload={onDownload}
      />
    </div>
  );
}
