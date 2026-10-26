import { useEffect, useRef, useState } from 'react';

import { sanitizeUrl } from '@braintree/sanitize-url';
import { ArrowsOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOut';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { MagnifyingGlassMinusIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlassMinus';
import { MagnifyingGlassPlusIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlassPlus';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { cn } from '../../utils/cn';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../Dialog';
import { IconButton } from '../IconButton';
import { Spinner } from '../Spinner';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';

export interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
  /** Omit to keep the visible title area hidden. */
  title?: string;
  /** The consumer owns download behavior and permissions. */
  onDownload?: () => void;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  src,
  alt,
  title,
  onDownload,
}: ImagePreviewDialogProps) {
  const openerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        showClose={false}
        className="h-[calc(100dvh-32px)] max-h-none w-[calc(100vw-32px)] sm:h-[calc(100dvh-64px)] sm:w-[calc(100vw-64px)]"
        childrenClassName="flex-1 gap-space-4 overflow-hidden p-space-4 sm:p-space-5"
        onOpenAutoFocus={(event) => {
          const activeElement = document.activeElement;
          openerRef.current =
            activeElement instanceof HTMLElement ? activeElement : null;
          // Keep initial focus inside the dialog without opening a control's tooltip.
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current?.focus();
        }}
      >
        <DialogDescription className="sr-only">
          Use the zoom controls to enlarge the image. Scroll or drag to pan.
          Press Escape to close.
        </DialogDescription>
        <ImagePreviewContent
          key={`${src}:${open}`}
          src={src}
          alt={alt}
          title={title}
          onDownload={onDownload}
        />
      </DialogContent>
    </Dialog>
  );
}

function ImagePreviewContent({
  src,
  alt,
  title,
  onDownload,
}: Pick<ImagePreviewDialogProps, 'src' | 'alt' | 'title' | 'onDownload'>) {
  const titleRef = useRef<HTMLElement | null>(null);
  const [titleTruncated, setTitleTruncated] = useState(false);
  const [titleTooltipOpen, setTitleTooltipOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<{ width: number; height: number }>();
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const fitScale =
    image && viewport.width && viewport.height
      ? Math.min(
          1,
          viewport.width / image.width,
          viewport.height / image.height
        )
      : 1;
  const scale = zoom ?? fitScale;
  const minScale = Math.min(0.25, fitScale);
  const ready =
    image !== undefined && !failed && viewport.width > 0 && viewport.height > 0;
  const canPan =
    ready &&
    (image.width * scale > viewport.width ||
      image.height * scale > viewport.height);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return;
    const measure = () =>
      setTitleTruncated(element.scrollWidth > element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [title]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const resize = () =>
      setViewport({ width: element.clientWidth, height: element.clientHeight });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fit = () => {
    setZoom(null);
    const element = viewportRef.current;
    if (element) {
      element.scrollLeft = 0;
      element.scrollTop = 0;
    }
  };

  return (
    <>
      <div className="flex min-w-0 shrink-0 items-center justify-end gap-space-4">
        <DialogTitle hidden={!title} className="min-w-0 flex-1">
          {title ? (
            <Tooltip
              title={title}
              open={titleTruncated && titleTooltipOpen}
              onOpenChange={setTitleTooltipOpen}
              side="bottom"
              align="start"
              disableHoverableContent={false}
              tooltipClassName="[overflow-wrap:anywhere]"
            >
              <Text
                ref={titleRef}
                as="span"
                variant="h3"
                weight="semibold"
                className="block truncate"
                tabIndex={titleTruncated ? 0 : undefined}
              >
                {title}
              </Text>
            </Tooltip>
          ) : (
            alt || 'Image preview'
          )}
        </DialogTitle>
        <div className="flex shrink-0 items-center gap-space-2">
          <IconButton
            type="button"
            icon={MagnifyingGlassMinusIcon}
            label="Zoom out"
            color="secondary"
            variant="plain"
            disabled={!ready || scale <= minScale}
            onClick={() => setZoom(Math.max(minScale, scale / 1.25))}
          />
          <Text
            as="span"
            variant="sm"
            role="status"
            aria-label="Image zoom"
            className="min-w-12 text-center"
          >
            {ready ? `${Math.round(scale * 100)}%` : '—'}
          </Text>
          <IconButton
            type="button"
            icon={MagnifyingGlassPlusIcon}
            label="Zoom in"
            color="secondary"
            variant="plain"
            disabled={!ready || scale >= 4}
            onClick={() => setZoom(Math.min(4, scale * 1.25))}
          />
          <IconButton
            type="button"
            icon={ArrowsOutIcon}
            label="Fit image"
            color="secondary"
            variant="plain"
            disabled={!ready}
            onClick={fit}
          />
          {onDownload && (
            <IconButton
              type="button"
              icon={DownloadSimpleIcon}
              label="Download image"
              color="secondary"
              variant="plain"
              onClick={onDownload}
            />
          )}
          <DialogClose asChild>
            <IconButton
              type="button"
              icon={XIcon}
              label="Close preview"
              color="secondary"
              variant="plain"
            />
          </DialogClose>
        </div>
      </div>
      <div
        ref={viewportRef}
        role="region"
        aria-label="Image viewport"
        tabIndex={0}
        className={cn(
          'relative min-h-0 min-w-0 flex-1 overflow-auto rounded-sm bg-surface-level-2 outline-none focus-visible:ring-2 focus-visible:ring-focus',
          canPan && 'touch-none cursor-grab',
          dragging && 'cursor-grabbing select-none'
        )}
        onPointerDown={(event) => {
          if (!canPan || event.button !== 0) return;
          const element = event.currentTarget;
          dragRef.current = {
            x: event.clientX,
            y: event.clientY,
            left: element.scrollLeft,
            top: element.scrollTop,
          };
          element.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          event.currentTarget.scrollLeft = drag.left - (event.clientX - drag.x);
          event.currentTarget.scrollTop = drag.top - (event.clientY - drag.y);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
          dragRef.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        onLostPointerCapture={() => {
          dragRef.current = null;
          setDragging(false);
        }}
      >
        <div
          className="flex min-h-full min-w-full items-center justify-center"
          style={{
            width: image ? image.width * scale : undefined,
            height: image ? image.height * scale : undefined,
          }}
        >
          {failed ? (
            <Text role="alert" variant="sm" color="secondary">
              The image could not be loaded.
            </Text>
          ) : (
            <>
              {!image && (
                <div
                  role="status"
                  className="absolute inset-0 flex items-center justify-center gap-space-2"
                >
                  <Spinner size="sm" />
                  <Text variant="sm">Loading image…</Text>
                </div>
              )}
              <img
                src={sanitizeUrl(src)}
                alt={alt}
                draggable={false}
                className={cn(
                  'block max-w-none shrink-0',
                  !image && 'invisible'
                )}
                style={{
                  width: image ? image.width * scale : undefined,
                  height: image ? image.height * scale : undefined,
                }}
                onLoad={(event) => {
                  const { naturalWidth: width, naturalHeight: height } =
                    event.currentTarget;
                  if (width > 0 && height > 0) setImage({ width, height });
                  else setFailed(true);
                }}
                onError={() => setFailed(true)}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
