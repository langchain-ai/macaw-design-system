import { lazy, Suspense } from 'react';

import { cn } from '../../utils/cn';
import { Skeleton } from '../Skeleton';

const RichInput = lazy(() =>
  import('./ChatComposerRichInput').then((module) => ({
    default: module.ChatComposerRichInput,
  }))
);

export interface ChatComposerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function ChatComposerInput({
  minHeight = 40,
  maxHeight = 240,
  ...props
}: ChatComposerInputProps) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'flex flex-col justify-center overflow-hidden px-space-1',
            props.className
          )}
          style={{ minHeight, maxHeight }}
          role="status"
          aria-label="Loading message editor"
        >
          <Skeleton className="w-2/3" />
        </div>
      }
    >
      <RichInput {...props} minHeight={minHeight} maxHeight={maxHeight} />
    </Suspense>
  );
}
