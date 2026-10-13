import CSVIcon from '../../icons/file-types/CSVIcon.svg?react';
import HTMLIcon from '../../icons/file-types/HTMLIcon.svg?react';
import IMGIcon from '../../icons/file-types/IMGIcon.svg?react';
import JSONIcon from '../../icons/file-types/JSONIcon.svg?react';
import MP3Icon from '../../icons/file-types/MP3Icon.svg?react';
import MP4Icon from '../../icons/file-types/MP4Icon.svg?react';
import PDFIcon from '../../icons/file-types/PDFIcon.svg?react';
import TXTIcon from '../../icons/file-types/TXTIcon.svg?react';
import { cn } from '../../utils/cn';
import type { IconComponent } from '../../utils/icon-types';

// Presentation only: this mapping does not determine safe preview or upload types.
export const getAttachmentIcon = (
  contentType: string | null
): IconComponent | null => {
  if (!contentType) {
    return null;
  }
  if (contentType.startsWith('image')) {
    return IMGIcon;
  }
  if (contentType.startsWith('audio')) {
    return MP3Icon;
  }
  if (contentType.startsWith('video')) {
    return MP4Icon;
  }
  if (contentType === 'text/html') {
    return HTMLIcon;
  }
  if (contentType === 'text/plain') {
    return TXTIcon;
  }
  if (contentType === 'text/csv') {
    return CSVIcon;
  }
  if (contentType === 'application/pdf') {
    return PDFIcon;
  }
  if (contentType === 'application/json') {
    return JSONIcon;
  }

  return null;
};

export const renderAttachmentIcon = (
  contentType: string | null,
  size: 'small' | 'default'
) => {
  const AttachmentIcon = getAttachmentIcon(contentType);
  return AttachmentIcon ? (
    <AttachmentIcon className={cn(size === 'small' && 'h-4 w-4')} />
  ) : null;
};
