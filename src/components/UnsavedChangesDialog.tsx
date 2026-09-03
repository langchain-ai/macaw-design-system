import type { FC, ReactNode } from 'react';

import { FloppyDiskIcon } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';

import { Button } from './Button';
import { Dialog, DialogContent } from './Dialog';
import { Text } from './Text';
import { Tooltip } from './Tooltip';

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  onDiscard?: () => void;
  title: string;
  description: string;
  saveCopy?: string | ReactNode;
  discardCopy?: string;
  disabledSaveTooltip?: string;
};

const UnsavedChangesDialog: FC<TProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onDiscard,
  title,
  description,
  saveCopy = 'Save',
  discardCopy = 'Discard',
  disabledSaveTooltip,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-96 flex-col rounded-lg bg-background shadow-xl"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        title={title}
        titleIcon={onConfirm ? FloppyDiskIcon : WarningCircleIcon}
        titleIconIntent={onConfirm ? 'info' : 'warning'}
        showClose={false}
      >
        <Text variant="sm" color="secondary">
          {description}
        </Text>
        <div className="flex w-full flex-row justify-end gap-2">
          <Button
            data-testid="save-confirmation-modal-cancel-button"
            size="sm"
            color="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          {onDiscard && (
            <Button
              size="sm"
              data-testid="save-confirmation-modal-discard-button"
              color="error"
              variant="outlined"
              onClick={onDiscard}
            >
              {discardCopy}
            </Button>
          )}

          {onConfirm && (
            <Tooltip title={disabledSaveTooltip}>
              <div>
                <Button
                  size="sm"
                  data-testid="save-confirmation-modal-save-button"
                  color="primary"
                  disabled={!!disabledSaveTooltip}
                  onClick={async () => {
                    await onConfirm();
                    onClose();
                  }}
                >
                  {saveCopy}
                </Button>
              </div>
            </Tooltip>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
