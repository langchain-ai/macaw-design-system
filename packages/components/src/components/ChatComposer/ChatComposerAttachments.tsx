import type { ReactNode } from 'react';
import { createContext, useContext, useRef } from 'react';

import { PaperclipIcon } from '@phosphor-icons/react/dist/ssr/Paperclip';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { cn } from '../../utils/cn';
import { Attachment, AttachmentList } from '../Attachment';
import type { AttachmentProps, AttachmentListProps } from '../Attachment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../IconButton';
import type { IconButtonProps } from '../IconButton';
import { Text } from '../Text';
import { useChatComposerContext } from './ChatComposerContext';

export interface ChatComposerAttachmentMenuProps {
  accept?: string;
  size?: IconButtonProps['size'];
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  children?: ReactNode;
}

export function ChatComposerAttachmentMenu({
  accept,
  size = 'sm',
  multiple = true,
  disabled = false,
  label = 'Add attachments',
  children,
}: ChatComposerAttachmentMenuProps) {
  const composer = useChatComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDisabled = composer.disabled || disabled;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            type="button"
            icon={PlusIcon}
            iconWeight="regular"
            label={label}
            size={size}
            color="secondary"
            variant="plain"
            disabled={isDisabled}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          collisionPadding={16}
          className="max-w-[var(--radix-dropdown-menu-content-available-width)]"
        >
          <DropdownMenuItem
            disabled={isDisabled || !composer.onFilesSelected}
            className="gap-space-2"
            onSelect={() => {
              if (!isDisabled) fileInputRef.current?.click();
            }}
          >
            <PaperclipIcon size={16} weight="regular" aria-hidden />
            <Text as="span" variant="sm">
              Upload files
            </Text>
          </DropdownMenuItem>
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Upload files"
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={isDisabled}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          if (!isDisabled && files.length) composer.onFilesSelected?.(files);
        }}
      />
    </>
  );
}

const AttachmentAppearanceContext = createContext<
  Pick<AttachmentProps, 'size' | 'variant'>
>({
  size: 'md',
  variant: 'file',
});

export interface ChatComposerAttachmentsProps
  extends AttachmentListProps, Pick<AttachmentProps, 'size' | 'variant'> {}

export function ChatComposerAttachments({
  className,
  layout = 'scroll',
  size = 'md',
  variant = 'file',
  ...props
}: ChatComposerAttachmentsProps) {
  return (
    <AttachmentAppearanceContext.Provider value={{ size, variant }}>
      <AttachmentList
        {...props}
        layout={layout}
        className={cn('no-scrollbar scroll-mask-l scroll-mask-r', className)}
      />
    </AttachmentAppearanceContext.Provider>
  );
}

export type ChatComposerAttachmentProps = AttachmentProps;

export function ChatComposerAttachment({
  disabled,
  size,
  variant,
  ...props
}: ChatComposerAttachmentProps) {
  const composer = useChatComposerContext();
  const appearance = useContext(AttachmentAppearanceContext);
  return (
    <Attachment
      {...props}
      size={size ?? appearance.size}
      variant={variant ?? appearance.variant}
      disabled={composer.disabled || disabled}
    />
  );
}
