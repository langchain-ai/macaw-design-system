import { cn } from '../../utils/cn';
import { Select } from '../Select';
import type { SelectProps } from '../Select';
import { CODE_LANGUAGES, resolveCodeLanguage } from './codeLanguages';
import type { CodeLanguageType } from './types';

export interface CodeLanguageSelectProps extends Pick<
  SelectProps,
  'disabled' | 'size' | 'aria-label' | 'triggerClassName'
> {
  value: string;
  onChange: (value: CodeLanguageType) => void;
}

export function CodeLanguageSelect({
  value,
  onChange,
  disabled,
  size = 'sm',
  'aria-label': ariaLabel = 'Code language',
  triggerClassName,
}: CodeLanguageSelectProps) {
  const language = resolveCodeLanguage(value);
  // Retain labels from existing Markdown even when no grammar is available.
  const options = language
    ? CODE_LANGUAGES
    : [...CODE_LANGUAGES, { value, label: value }];

  return (
    <Select
      aria-label={ariaLabel}
      value={language ?? value}
      options={options}
      onChange={(next) => {
        const resolved =
          next === undefined ? undefined : resolveCodeLanguage(next);
        if (resolved !== undefined) onChange(resolved);
      }}
      disabled={disabled}
      size={size}
      align="end"
      triggerClassName={cn(
        'w-auto max-w-[min(10rem,100%)] border-0 bg-transparent shadow-none',
        triggerClassName
      )}
    />
  );
}
