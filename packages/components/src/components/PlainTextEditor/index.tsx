import { useLayoutEffect, useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import { cn } from '../../utils/cn';
import { TextWithLinks } from '../TextWithLinks';
import { useResizeTextEditor } from './hooks/useResizeTextEditor';

const COMMON_CLS = cn(
  'text-md col-[1] row-[1] m-0 w-full overflow-y-hidden whitespace-pre-wrap break-words border-none bg-transparent p-0 text-base'
);

export function PlainTextEditor(props: {
  id?: string;
  textRef?: React.RefObject<HTMLTextAreaElement | null>;
  value?: string | null | undefined;
  placeholder?: string;
  className?: string;
  onChange?: (e: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
  readOnly?: boolean;
  textareaClassName?: string;
  resize?: boolean;
  defaultRows?: number;
  fullLength?: boolean;
  maxHeight?: number | string;
}) {
  // Internal state for immediate UI updates
  const [internalValue, setInternalValue] = useState(props.value ?? '');
  const { displayDivRef, textAreaRef, maxHeight } = useResizeTextEditor({
    maxHeight: props.maxHeight,
    internalValue,
    textRef: props.textRef,
  });

  useLayoutEffect(() => {
    setInternalValue(props.value ?? '');
  }, [props.value]);

  const [hasScroll, setHasScroll] = useState(false);
  useLayoutEffect(() => {
    if (textAreaRef.current) {
      setHasScroll(
        textAreaRef.current.scrollHeight > textAreaRef.current.clientHeight
      );
    }
  }, [textAreaRef]);

  // Debounced callback for parent updates
  const debouncedOnChange = useDebouncedCallback((value: string) => {
    props.onChange?.(value);
  }, 100);

  let valueToDisplay = internalValue;

  // https://react.dev/errors/31?invariant=31&args%5B%5D=object%2520with%2520keys%2520%257Bcontent%252C%2520additional_kwargs%252C%2520response_metadata%252C%2520type%252C%2520name%252C%2520id%252C%2520example%252C%2520tool_calls%252C%2520invalid_tool_calls%252C%2520usage_metadata%257D
  if (typeof valueToDisplay !== 'string' && valueToDisplay != null) {
    valueToDisplay = JSON.stringify(valueToDisplay);
  }

  // Use different rendering approaches for read-only vs editable content
  // Read-only: Simple display with expandable text
  // Editable: Complex textarea overlay for full editing capabilities
  if (props.readOnly) {
    return (
      <div
        className={cn(
          COMMON_CLS,
          'pointer-events-auto select-text',
          props.className
        )}
      >
        <TextWithLinks
          text={valueToDisplay ?? ''}
          fullLength={props.fullLength}
        />
      </div>
    );
  }

  return (
    <div className={cn('grid w-full grid-cols-1', props.className)}>
      <textarea
        ref={textAreaRef}
        id={props.id}
        className={cn(
          COMMON_CLS,
          'text-transparent caret-[var(--text-primary)] placeholder:text-quaternary',
          props.textareaClassName,
          !props.resize && 'resize-none'
        )}
        style={{
          maxHeight,
        }}
        value={valueToDisplay ?? ''}
        rows={props.defaultRows ?? 1}
        onChange={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setInternalValue(target.value);
          debouncedOnChange(target.value);
        }}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        readOnly={props.readOnly}
        autoFocus={props.autoFocus && !props.readOnly}
        onKeyDown={props.onKeyDown}
      />
      {/* NOTE: this div displays the text in this editor, not the textarea */}
      <div
        ref={displayDivRef}
        aria-hidden
        className={cn(
          COMMON_CLS,
          'pointer-events-none select-none',
          hasScroll && 'pr-4',
          props.textareaClassName
        )}
        style={{
          maxHeight,
        }}
      >
        <TextWithLinks
          text={valueToDisplay ?? ''}
          fullLength={true}
          useRawSpan={true}
        />
        {valueToDisplay?.endsWith('\n') && <br />}
      </div>
    </div>
  );
}
