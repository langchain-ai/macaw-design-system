import type { ReactNode } from 'react';

import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { ChatRichContentState } from './ChatRichContent.types';

export function ChatRichContentStatus({
  id,
  live,
  compact,
  state,
  isError,
  children,
}: {
  id: string;
  /** Only one copy is announced and referenced when the status renders twice. */
  live: boolean;
  compact: boolean;
  state: ChatRichContentState;
  isError: boolean;
  children: ReactNode;
}) {
  const iconSize = compact ? 'sm' : 'md';
  return (
    <Text
      id={live ? id : undefined}
      role={live ? (isError ? 'alert' : 'status') : undefined}
      variant={compact ? 'xs' : 'sm'}
      className={cn(
        'flex min-w-0 items-center gap-space-1 text-tertiary',
        compact ? 'max-w-[50%]' : 'flex-1',
        !compact &&
          (state === 'approved' || state === 'rejected') &&
          'justify-end',
        isError && 'text-error-primary'
      )}
    >
      {(state === 'submitted' || state === 'approved') && (
        <Icon
          icon={CheckIcon}
          aria-hidden
          size={iconSize}
          weight="regular"
          className="shrink-0 text-success-primary"
        />
      )}
      {state === 'rejected' && (
        <Icon
          icon={XIcon}
          aria-hidden
          size={iconSize}
          weight="regular"
          className="shrink-0"
        />
      )}
      <span className={cn('min-w-0', compact && 'truncate')}>{children}</span>
    </Text>
  );
}
