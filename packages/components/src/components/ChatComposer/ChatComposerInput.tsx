import { lazy, Suspense, type Ref } from 'react';

import { cn } from '../../utils/cn';
import { ErrorBoundary } from '../ErrorBoundary';
import { Skeleton } from '../Skeleton';
import { ChatComposerPlainInput } from './ChatComposerPlainInput';

const RichInput = lazy(() =>
  import('./ChatComposerRichInput').then((module) => ({
    default: module.ChatComposerRichInput,
  }))
);

export interface ChatComposerInputHandle {
  focus: () => void;
}

export interface ChatComposerInputProps {
  ref?: Ref<ChatComposerInputHandle>;
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
    // A failed editor load or render falls back to plain text so the message
    // can still be written and sent. React caches a rejected lazy import, so a
    // retry would not reload it; the fallback stays until the page reloads.
    <ErrorBoundary
      fallback={() => (
        <ChatComposerPlainInput
          {...props}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />
      )}
    >
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
    </ErrorBoundary>
  );
}
