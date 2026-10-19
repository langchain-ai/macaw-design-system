import type { ComponentPropsWithRef, ReactNode } from 'react';
import { forwardRef, useId } from 'react';

import { FileIcon } from '@phosphor-icons/react/dist/ssr/File';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { cn } from '../../utils/cn';
import {
  CONTROL_SIZES,
  VISUAL_ELEMENT_SIZES,
} from '../../utils/componentSizes';
import { Button } from '../Button';
import { Icon, type IconComponent } from '../Icon';
import { IconButton } from '../IconButton';
import { SpinnerIcon } from '../Spinner';
import { Text } from '../Text';
import { getAttachmentIcon } from './render-attachment-icon';

export interface AttachmentProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onClick'
> {
  name: string;
  contentType?: string | null;
  icon?: IconComponent;
  /** Noninteractive thumbnail content. The consumer owns its source and lifecycle. */
  preview?: ReactNode;
  /** Secondary information, inline in compact rows and stacked in large rows. */
  metadata?: ReactNode;
  variant?: 'file' | 'thumbnail';
  /** File-row height: sm=24px, md=32px, lg=48px. Thumbnails use larger tiles. */
  size?: 'sm' | 'md' | 'lg';
  status?: 'ready' | 'loading' | 'uploading' | 'error';
  /** Disables opening, removal, and custom actions. */
  disabled?: boolean;
  onOpen?: () => void;
  openLabel?: string;
  onRemove?: () => void;
  /** Sibling controls; use xs/sm/md buttons or smaller for sm/md/lg rows. */
  actions?: ReactNode;
}

const SIZE_STYLES = {
  sm: {
    height: CONTROL_SIZES.sm.heightClassName,
    padding: 'px-space-1',
    media: VISUAL_ELEMENT_SIZES.xs.className,
    thumbnail: 'w-24',
  },
  md: {
    height: CONTROL_SIZES.md.heightClassName,
    padding: 'px-space-1',
    media: VISUAL_ELEMENT_SIZES.sm.className,
    thumbnail: 'w-32',
  },
  lg: {
    height: 'h-12',
    padding: 'px-space-2',
    media: 'size-9',
    thumbnail: 'w-40',
  },
};

export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(
  function Attachment(
    {
      name,
      contentType,
      icon,
      preview,
      metadata,
      variant = 'file',
      size = 'md',
      status = 'ready',
      disabled = false,
      onOpen,
      openLabel = `View ${name}`,
      onRemove,
      actions,
      className,
      ...props
    },
    ref
  ) {
    const statusId = useId();
    const sizeStyles = SIZE_STYLES[size];
    const isThumbnail = variant === 'thumbnail';
    const hasMediaBackground = isThumbnail || size !== 'sm';
    const stackedText = isThumbnail || size === 'lg';
    const isBusy = status === 'loading' || status === 'uploading';
    const hasPreview = preview != null && status === 'ready';
    const description =
      status === 'uploading'
        ? 'Uploading…'
        : status === 'loading'
          ? 'Loading attachment…'
          : status === 'error'
            ? 'Upload failed.'
            : undefined;
    const removeButton = onRemove ? (
      <IconButton
        type="button"
        icon={XIcon}
        iconWeight="regular"
        iconClassName={
          isThumbnail
            ? size === 'sm'
              ? 'size-2.5'
              : 'size-3'
            : size === 'sm'
              ? 'size-3'
              : 'size-3.5'
        }
        label={`Remove ${name}`}
        disabled={disabled}
        color="secondary"
        variant={isThumbnail ? 'normal' : 'plain'}
        round={isThumbnail}
        className={cn(
          isThumbnail && [
            'absolute top-0 right-0',
            'hover:bg-elevated-hover border-0 shadow-none',
            'duration-fast transition-opacity motion-reduce:transition-none',
            '[@media(hover:hover)]:group-[:not(:is(:hover,:focus-within))]/attachment:pointer-events-none',
            '[@media(hover:hover)]:group-[:not(:is(:hover,:focus-within))]/attachment:opacity-0',
          ]
        )}
        size={size === 'sm' ? 'xxs' : size === 'md' ? 'xs' : 'sm'}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) onRemove();
        }}
      />
    ) : null;
    const media = hasPreview ? (
      preview
    ) : (
      <Icon
        aria-hidden
        icon={
          isBusy
            ? SpinnerIcon
            : status === 'error'
              ? WarningCircleIcon
              : (icon ?? getAttachmentIcon(contentType ?? null) ?? FileIcon)
        }
        size={size}
        weight="regular"
        color={
          status === 'error'
            ? 'error'
            : hasMediaBackground
              ? 'neutral'
              : undefined
        }
        className={cn(
          'rounded-xs',
          size === 'sm' && sizeStyles.media,
          !hasMediaBackground && 'bg-transparent dark:bg-transparent',
          status !== 'error' && [
            'text-icon-secondary',
            hasMediaBackground && 'bg-surface-level-2',
          ]
        )}
      />
    );
    const content = (
      <span
        className={cn(
          'flex min-w-0 flex-1 items-center',
          size === 'sm' && !isThumbnail ? 'gap-space-1' : 'gap-space-2',
          isThumbnail && 'w-full max-w-full flex-none flex-col items-stretch'
        )}
      >
        {hasPreview || isThumbnail ? (
          <span
            aria-hidden
            className={cn(
              'flex shrink-0 items-center justify-center overflow-hidden rounded-xs [&>img]:size-full [&>img]:object-cover',
              isThumbnail && status === 'error'
                ? 'bg-error-subtle dark:bg-error'
                : hasMediaBackground && 'bg-surface-level-2',
              isThumbnail
                ? 'relative aspect-square w-full [&>img]:absolute [&>img]:inset-0'
                : sizeStyles.media
            )}
          >
            {media}
          </span>
        ) : (
          media
        )}
        <span
          className={cn(
            'flex min-w-0 flex-1',
            stackedText ? 'gap-space-1 flex-col' : 'gap-space-2 items-baseline',
            isThumbnail && 'w-full max-w-full flex-none'
          )}
        >
          <Text
            as="span"
            dir="rtl"
            variant={size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'}
            className={cn(
              'text-primary max-w-48 min-w-0 truncate text-left',
              isThumbnail && 'w-full max-w-full'
            )}
            title={name}
          >
            <bdi dir="ltr">{name}</bdi>
          </Text>
          {metadata != null && !description && (
            <Text
              as="span"
              variant="xs"
              color="quaternary"
              className={cn(
                'max-w-48 min-w-0 truncate',
                isThumbnail && 'w-full max-w-full'
              )}
              title={typeof metadata === 'string' ? metadata : undefined}
            >
              {metadata}
            </Text>
          )}
          <span
            id={statusId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              description ? 'max-w-full min-w-0' : 'sr-only',
              description &&
                status === 'error' &&
                !stackedText &&
                'max-w-[75%] shrink-0 grow'
            )}
          >
            {description && (
              <Text
                as="span"
                variant="xs"
                title={description}
                className={cn(
                  'text-tertiary block truncate',
                  status === 'error' && 'text-error-secondary'
                )}
              >
                <span className="sr-only">{name}: </span>
                {description}
              </Text>
            )}
          </span>
        </span>
      </span>
    );

    return (
      <div
        ref={ref}
        role="group"
        aria-label={name}
        {...props}
        aria-disabled={disabled || undefined}
        onClick={(event) => {
          // Extend the preview button to the card's padding and gaps only.
          if (!disabled && onOpen && event.target === event.currentTarget) {
            event.stopPropagation();
            onOpen();
          }
        }}
        className={cn(
          'gap-space-2 border-subtle bg-surface-level-1 box-border flex max-w-full min-w-0 shrink-0 items-center rounded-xs border',
          isThumbnail
            ? [
                sizeStyles.thumbnail,
                'group/attachment relative flex-col items-stretch',
                size === 'sm' ? 'p-space-1' : 'p-space-2',
              ]
            : [sizeStyles.height, sizeStyles.padding],
          status === 'error' && 'border-error',
          onOpen && !disabled && 'cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {onOpen ? (
          <Button
            type="button"
            color="secondary"
            variant="plain"
            aria-label={openLabel}
            disabled={disabled}
            aria-describedby={description ? statusId : undefined}
            className={cn(
              'min-w-0 flex-1 justify-start p-0 text-left',
              isThumbnail
                ? 'h-auto w-full max-w-full flex-none whitespace-normal'
                : 'h-full'
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) onOpen();
            }}
          >
            {content}
          </Button>
        ) : (
          content
        )}
        {isThumbnail && removeButton}
        {(actions != null || (!isThumbnail && onRemove)) && (
          <fieldset
            disabled={disabled}
            inert={disabled || undefined}
            aria-label={`Actions for ${name}`}
            className={cn(
              'gap-space-1 m-0 flex max-w-full min-w-0 shrink-0 items-center justify-end border-0 p-0',
              isThumbnail && 'flex-wrap'
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
            {!isThumbnail && removeButton}
          </fieldset>
        )}
      </div>
    );
  }
);
