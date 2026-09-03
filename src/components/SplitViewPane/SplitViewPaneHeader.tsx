import type { MouseEvent, ReactNode } from 'react';

import { CornersOutIcon } from '@phosphor-icons/react/dist/ssr/CornersOut';

import {
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretUpIcon,
} from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import zIndices from '../../utils/zIndices';
import { IconButton } from '../IconButton';
import { Kbd } from '../Kbd';
import { createPortalSlot } from '../PortalSlot';
import { Text } from '../Text';

export const HeaderTitleActionSlot = createPortalSlot();

export function SplitViewPaneHeader({
  title,
  onClose,
  onExpand,
  onNext,
  onPrevious,
  hideArrows,
  headerClassName,
  titleId,
}: {
  title: ReactNode;
  onClose?: () => void;
  onExpand?: (event: MouseEvent<HTMLButtonElement>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hideArrows?: boolean;
  headerClassName?: string;
  titleId?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 flex items-center gap-space-1 border-b border-subtle bg-elevated px-space-4 py-1.5 text-base font-semibold text-secondary',
        headerClassName
      )}
      style={{ zIndex: zIndices.stickyHeader }}
    >
      <IconButton
        label="Close"
        icon={CaretDoubleRightIcon}
        onClick={onClose}
        variant="plain"
        color="secondary"
        size="xs"
        iconClassName="size-5 text-icon-tertiary"
        data-testid="split-view-pane-close-button"
        className="bg-transparent"
      />

      {onExpand && (
        <IconButton
          label="Expand"
          icon={CornersOutIcon}
          onClick={onExpand}
          variant="plain"
          color="secondary"
          size="sm"
          iconClassName="text-icon-tertiary"
          data-testid="split-view-pane-expand-button"
          className="bg-transparent"
        />
      )}
      {!hideArrows && (
        <>
          <div className="mx-space-1 h-5 border-r border-default" />
          <IconButton
            label="Navigate down"
            tooltipProps={{
              title: (
                <div className="flex items-center">
                  <Text variant="sm">Navigate down</Text>
                  <Kbd className="ml-space-2">J</Kbd>
                </div>
              ),
            }}
            icon={CaretDownIcon}
            onClick={onNext}
            variant="plain"
            color="secondary"
            size="xs"
            iconClassName={cn('size-5', onNext && 'text-icon-tertiary')}
            disabled={!onNext}
            className="bg-transparent"
          />

          <IconButton
            label="Navigate up"
            tooltipProps={{
              title: (
                <div className="flex items-center">
                  <Text variant="sm">Navigate up</Text>
                  <Kbd className="ml-space-2">K</Kbd>
                </div>
              ),
            }}
            icon={CaretUpIcon}
            onClick={onPrevious}
            variant="plain"
            color="secondary"
            size="xs"
            iconClassName={cn('size-5', onPrevious && 'text-icon-tertiary')}
            disabled={!onPrevious}
            className="bg-transparent"
          />
        </>
      )}
      {titleId && (
        <Text
          id={titleId}
          as="h2"
          variant="h3"
          className="min-w-0"
          color="secondary"
        >
          {title}
        </Text>
      )}

      <HeaderTitleActionSlot.Slot className="flex flex-1 items-center justify-end gap-space-2 empty:hidden" />
    </header>
  );
}
