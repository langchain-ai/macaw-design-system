import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useState,
} from 'react';

import {
  DialogClose as RadixDialogClose,
  DialogDescription as RadixDialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle as RadixDialogTitle,
  Dialog as RadixDialog,
  DialogContent as RadixDialogContent,
  type DialogContentProps as RadixDialogContentProps,
} from '@radix-ui/react-dialog';

import { XIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/merge-refs';
import { useZIndex } from '../../utils/useZIndex';
import { ZIndexProvider } from '../../utils/ZIndexContext';
import zIndices from '../../utils/zIndices';
import { Icon } from '../Icon';
import type { IconComponent } from '../Icon';
import { IconButton } from '../IconButton';
import { Text } from '../Text';

/**
 * Exposes the modal DialogContent DOM node to descendants so portaled overlays
 * (e.g. Typeahead's Popover) can render inside the dialog. A modal Dialog sets
 * `pointer-events: none` outside DialogContent, so overlays portaled to
 * `document.body` become mouse-inert; portaling into this node keeps them
 * interactive. Null when not inside a Dialog.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const DialogContainerContext = createContext<HTMLElement | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useDialogContainer(): HTMLElement | null {
  return useContext(DialogContainerContext);
}

export type DialogTitleProps = ComponentPropsWithoutRef<
  typeof RadixDialogTitle
>;

/** Associates a custom-composed heading with the dialog content. */
export const DialogTitle = forwardRef<
  ComponentRef<typeof RadixDialogTitle>,
  DialogTitleProps
>((props, ref) => <RadixDialogTitle ref={ref} {...props} />);
DialogTitle.displayName = 'DialogTitle';

export type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof RadixDialogDescription
>;

/** Associates supporting copy with the dialog content. */
export const DialogDescription = forwardRef<
  ComponentRef<typeof RadixDialogDescription>,
  DialogDescriptionProps
>((props, ref) => <RadixDialogDescription ref={ref} {...props} />);
DialogDescription.displayName = 'DialogDescription';

export type DialogCloseProps = ComponentPropsWithoutRef<
  typeof RadixDialogClose
>;

/** Closes the nearest dialog and supports custom controls through `asChild`. */
export const DialogClose = forwardRef<
  ComponentRef<typeof RadixDialogClose>,
  DialogCloseProps
>((props, ref) => <RadixDialogClose ref={ref} {...props} />);
DialogClose.displayName = 'DialogClose';

type TitleIconIntent = 'error' | 'warning' | 'info';

interface DialogContentProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Icon component to display in the title area, inside a colored circular container */
  titleIcon?: IconComponent;
  /** Controls the background and color of the title icon container */
  titleIconIntent?: TitleIconIntent;
  showClose?: boolean;
  children: ReactNode;
  className?: string;
  childrenClassName?: string;
  onPointerDownOutside?: RadixDialogContentProps['onPointerDownOutside'];
  onInteractOutside?: RadixDialogContentProps['onInteractOutside'];
  onOpenAutoFocus?: RadixDialogContentProps['onOpenAutoFocus'];
  onCloseAutoFocus?: RadixDialogContentProps['onCloseAutoFocus'];
  onEscapeKeyDown?: RadixDialogContentProps['onEscapeKeyDown'];
  onKeyDown?: RadixDialogContentProps['onKeyDown'];
}

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
  onEscapeKeyDown,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  onEscapeKeyDown?: (e: ReactKeyboardEvent) => void;
}) {
  const zIndex = useZIndex(zIndices.dialogOverlay);
  return (
    <RadixDialog modal={true} open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className={cn(
            'fixed inset-0 bg-overlay',
            'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out motion-reduce:animate-none',
            className
          )}
          style={{ zIndex }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && onEscapeKeyDown) {
              onEscapeKeyDown(e);
            }
          }}
        >
          {children}
        </DialogOverlay>
      </DialogPortal>
    </RadixDialog>
  );
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      title,
      description,
      titleIcon: TitleIcon,
      titleIconIntent = 'info',
      showClose = true,
      children,
      className,
      childrenClassName,
      onPointerDownOutside,
      onInteractOutside,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onEscapeKeyDown,
      onKeyDown,
    },
    ref
  ) => {
    const dialogZIndex = useZIndex(zIndices.dialogContent);
    const hasHeader = Boolean(title || description || showClose);
    // A modal Dialog sets `pointer-events: none` outside this node, so overlays
    // portaled to `document.body` (e.g. Typeahead's Popover) become mouse-inert.
    // Expose the content node so descendants can portal into it and stay live.
    const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);

    return (
      <RadixDialogContent
        ref={mergeRefs([ref, setContentNode])}
        className={cn(
          'fixed left-[50%] top-[50%] flex max-h-[calc(100vh-2rem)] w-[37.5rem] translate-x-[-50%] translate-y-[-50%] flex-col rounded-lg bg-background',
          'fade-in',
          'data-[state=closed]:fade-out',
          className
        )}
        style={{ zIndex: dialogZIndex }}
        onPointerDownOutside={onPointerDownOutside}
        onInteractOutside={onInteractOutside}
        onOpenAutoFocus={onOpenAutoFocus}
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={onEscapeKeyDown}
        onKeyDown={onKeyDown}
      >
        <ZIndexProvider value={dialogZIndex}>
          <DialogContainerContext.Provider value={contentNode}>
            {hasHeader && (
              <div className="m-0 min-h-14 shrink-0 p-space-4">
                <div className="flex items-center justify-between gap-space-4">
                  <div className="flex min-w-0 items-center gap-space-2">
                    {TitleIcon && (
                      <Icon
                        icon={TitleIcon}
                        color={titleIconIntent}
                        size="md"
                      />
                    )}
                    <div className="flex min-w-0 flex-col gap-space-1">
                      {title && (
                        <DialogTitle asChild>
                          <Text variant="h3" weight="semibold">
                            {title}
                          </Text>
                        </DialogTitle>
                      )}
                      {description && (
                        <DialogDescription asChild>
                          <Text variant="sm" className="text-quaternary">
                            {description}
                          </Text>
                        </DialogDescription>
                      )}
                    </div>
                  </div>
                  {showClose && (
                    <DialogClose asChild>
                      <IconButton
                        icon={XIcon}
                        label="Close"
                        color="secondary"
                        variant="plain"
                        className="shrink-0 self-start"
                        data-testid="dialog-close-button"
                        tooltipProps={{ disabled: true }}
                      />
                    </DialogClose>
                  )}
                </div>
              </div>
            )}
            <div
              className={cn(
                'flex min-h-0 flex-col gap-space-4 overflow-y-auto p-space-4',
                hasHeader && 'pt-0',
                childrenClassName
              )}
            >
              {children}
            </div>
          </DialogContainerContext.Provider>
        </ZIndexProvider>
      </RadixDialogContent>
    );
  }
);

DialogContent.displayName = 'DialogContent';
