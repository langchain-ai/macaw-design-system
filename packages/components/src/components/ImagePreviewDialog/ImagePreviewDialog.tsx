import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ArrowsOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOut';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { MagnifyingGlassMinusIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlassMinus';
import { MagnifyingGlassPlusIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlassPlus';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { clamp } from '../../utils/clamp';
import { cn } from '../../utils/cn';
import { sanitizeImageSrc } from '../../utils/sanitizeImageSrc';
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
  altText: string;
  /** Omit to keep the visible title area hidden. */
  title?: string;
  /** The consumer owns download behavior and permissions. */
  onDownload?: () => void;
}

// Safari-only pinch event; not in the standard DOM typings.
type GestureEvent = UIEvent & { scale: number; clientX: number; clientY: number };

export function ImagePreviewDialog({
  open,
  onOpenChange,
  src,
  altText,
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
          Use the zoom controls or pinch to enlarge the image. Scroll or drag to
          pan.
        </DialogDescription>
        <ImagePreviewContent
          key={`${src}:${open}`}
          src={src}
          altText={altText}
          title={title}
          onDownload={onDownload}
        />
      </DialogContent>
    </Dialog>
  );
}

function ImagePreviewContent({
  src,
  altText,
  title,
  onDownload,
}: Pick<ImagePreviewDialogProps, 'src' | 'altText' | 'title' | 'onDownload'>) {
  const titleRef = useRef<HTMLElement | null>(null);
  const [titleTooltipOpen, setTitleTooltipOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const anchorRef = useRef<{
    x: number;
    y: number;
    fractionX: number;
    fractionY: number;
  } | null>(null);
  const [image, setImage] = useState<{ width: number; height: number }>();
  const [failed, setFailed] = useState(false);
  // null means fit mode, where CSS sizes the image to the viewport.
  const [zoom, setZoom] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const ready = image !== undefined && !failed;
  const zoomedSize =
    image && zoom !== null
      ? { width: image.width * zoom, height: image.height * zoom }
      : undefined;

  const zoomBy = useCallback(
    (factor: number, point?: { x: number; y: number }) => {
      const element = viewportRef.current;
      if (!element || !image) return;
      const x = point?.x ?? element.clientWidth / 2;
      const y = point?.y ?? element.clientHeight / 2;
      anchorRef.current = {
        x,
        y,
        fractionX: (element.scrollLeft + x) / element.scrollWidth,
        fractionY: (element.scrollTop + y) / element.scrollHeight,
      };
      setZoom((current) => {
        const scale =
          current ??
          Math.min(
            1,
            element.clientWidth / image.width,
            element.clientHeight / image.height
          );
        return clamp(scale * factor, Math.min(0.25, scale), 4);
      });
    },
    [image]
  );

  // Keep the anchored point under the cursor after the image resizes.
  useLayoutEffect(() => {
    const element = viewportRef.current;
    const anchor = anchorRef.current;
    if (!element || !anchor) return;
    anchorRef.current = null;
    element.scrollLeft = anchor.fractionX * element.scrollWidth - anchor.x;
    element.scrollTop = anchor.fractionY * element.scrollHeight - anchor.y;
  }, [zoom]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const pointFrom = (event: { clientX: number; clientY: number }) => {
      const rect = element.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    // Chromium and Firefox report trackpad pinch as ctrl+wheel.
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const delta = clamp(event.deltaY, -25, 25);
      zoomBy(Math.exp(-delta * 0.01), pointFrom(event));
    };
    // Safari reports pinch as gesture events with a cumulative scale.
    let gestureScale = 1;
    const onGestureStart = (event: Event) => {
      event.preventDefault();
      gestureScale = 1;
    };
    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as GestureEvent;
      zoomBy(gesture.scale / gestureScale, pointFrom(gesture));
      gestureScale = gesture.scale;
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('gesturestart', onGestureStart);
    element.addEventListener('gesturechange', onGestureChange);
    return () => {
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('gesturestart', onGestureStart);
      element.removeEventListener('gesturechange', onGestureChange);
    };
  }, [zoomBy]);

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
              open={titleTooltipOpen}
              onOpenChange={(open) => {
                const element = titleRef.current;
                setTitleTooltipOpen(
                  open && !!element && element.scrollWidth > element.clientWidth
                );
              }}
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
                tabIndex={0}
              >
                {title}
              </Text>
            </Tooltip>
          ) : (
            altText || 'Image preview'
          )}
        </DialogTitle>
        <div className="flex shrink-0 items-center gap-space-2">
          <IconButton
            type="button"
            icon={MagnifyingGlassMinusIcon}
            label="Zoom out"
            color="secondary"
            variant="plain"
            disabled={!ready || (zoom !== null && zoom <= 0.25)}
            onClick={() => zoomBy(1 / 1.25)}
          />
          <Text
            as="span"
            variant="sm"
            role="status"
            aria-label="Image zoom"
            className="min-w-12 text-center"
          >
            {!ready ? '—' : zoom === null ? 'Fit' : `${Math.round(zoom * 100)}%`}
          </Text>
          <IconButton
            type="button"
            icon={MagnifyingGlassPlusIcon}
            label="Zoom in"
            color="secondary"
            variant="plain"
            disabled={!ready || (zoom !== null && zoom >= 4)}
            onClick={() => zoomBy(1.25)}
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
          'relative min-h-0 min-w-0 flex-1 overflow-auto rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-focus',
          zoom !== null && 'touch-none cursor-grab',
          dragging && 'cursor-grabbing select-none'
        )}
        onPointerDown={(event) => {
          const element = event.currentTarget;
          const canPan =
            element.scrollWidth > element.clientWidth ||
            element.scrollHeight > element.clientHeight;
          if (!canPan || event.button !== 0) return;
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
          className={cn(
            'flex items-center justify-center',
            zoomedSize ? 'min-h-full min-w-full' : 'h-full w-full'
          )}
          style={zoomedSize}
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
                src={sanitizeImageSrc(src)}
                alt={altText}
                draggable={false}
                className={cn(
                  'block shrink-0',
                  zoomedSize
                    ? 'max-w-none'
                    : 'max-h-full max-w-full object-contain',
                  !image && 'invisible'
                )}
                style={zoomedSize}
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
