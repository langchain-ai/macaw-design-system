import { useRef, useState, type FC, type ReactNode } from 'react';

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
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const handleClose = () => {
    if (isSavingRef.current) return;
    setSaveError(undefined);
    onClose();
  };

  const handleConfirm = async () => {
    if (!onConfirm || isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError(undefined);
    try {
      await onConfirm();
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message
          ? error.message
          : "We couldn't save your changes. Try again."
      );
      return;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="w-96 flex-col rounded-lg bg-background shadow-xl"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onPointerDownOutside={(event) => {
          if (isSavingRef.current) event.preventDefault();
        }}
        title={title}
        titleIcon={onConfirm ? FloppyDiskIcon : WarningCircleIcon}
        titleIconIntent={onConfirm ? 'info' : 'warning'}
        showClose={false}
      >
        <Text variant="sm" color="secondary">
          {description}
        </Text>
        {saveError && (
          <Text variant="sm" color="error" role="alert">
            {saveError}
          </Text>
        )}
        <div className="flex w-full flex-row justify-end gap-2">
          <Button
            data-testid="save-confirmation-modal-cancel-button"
            size="sm"
            color="secondary"
            disabled={isSaving}
            onClick={handleClose}
          >
            Cancel
          </Button>
          {onDiscard && (
            <Button
              size="sm"
              data-testid="save-confirmation-modal-discard-button"
              color="error"
              variant="outlined"
              disabled={isSaving}
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
                  disabled={isSaving || !!disabledSaveTooltip}
                  loading={isSaving}
                  onClick={handleConfirm}
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
