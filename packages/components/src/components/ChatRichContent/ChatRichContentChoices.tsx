import { useRef } from 'react';

import { Checkbox } from '../Checkbox';
import { Input } from '../Input';
import { RadioButton } from '../RadioButton';
import { RadioGroup } from '../RadioGroup';
import type { ChatRichContentChoicesProps } from './ChatRichContent.types';

export function ChatRichContentChoices({
  mode,
  options,
  value,
  onChange,
  'aria-label': label,
  allowCustom = false,
  disabled = false,
  isError = false,
}: ChatRichContentChoicesProps) {
  const focusCustomInput = useRef(false);
  const customSelected = allowCustom && value.custom?.selected === true;

  function selectCustom(selected: boolean) {
    if (disabled) return;
    focusCustomInput.current = selected && !customSelected;
    onChange({
      selected: mode === 'single' ? [] : value.selected,
      custom: { selected, text: value.custom?.text ?? '' },
    });
  }

  const customLabelProps = customSelected
    ? { 'aria-label': 'Something else…' }
    : { label: 'Something else…' };
  const customInput = customSelected && (
    <Input
      ref={(element) => {
        if (element && focusCustomInput.current && !disabled) {
          element.focus();
          focusCustomInput.current = false;
        }
      }}
      aria-label={`${label} — Something else`}
      placeholder="Something else…"
      size="sm"
      variant="plain"
      className="min-w-0 flex-1"
      debounceMs={0}
      disabled={disabled}
      isError={isError}
      value={value.custom?.text ?? ''}
      onChange={(text) => {
        if (disabled) return;
        onChange({ ...value, custom: { selected: true, text } });
      }}
    />
  );

  return mode === 'single' ? (
    <RadioGroup
      aria-label={label}
      aria-invalid={isError || undefined}
      disabled={disabled}
      className="flex flex-col gap-space-1"
      value={
        customSelected
          ? 'custom'
          : value.selected[0] === undefined
            ? ''
            : `option:${value.selected[0]}`
      }
      onValueChange={(next) => {
        if (disabled) return;
        if (next === 'custom') {
          selectCustom(true);
          return;
        }
        focusCustomInput.current = false;
        onChange({
          selected: [next.slice('option:'.length)],
          ...(value.custom && {
            custom: { ...value.custom, selected: false },
          }),
        });
      }}
    >
      {options.map((option) => (
        <RadioButton
          key={option.value}
          value={`option:${option.value}`}
          label={option.label}
          disabled={disabled}
          className="min-h-6"
        />
      ))}
      {allowCustom && (
        <div className="flex min-h-6 min-w-0 items-center gap-space-2">
          <RadioButton
            value="custom"
            {...customLabelProps}
            disabled={disabled}
          />
          {customInput}
        </div>
      )}
    </RadioGroup>
  ) : (
    <div
      role="group"
      aria-label={label}
      aria-invalid={isError || undefined}
      className="flex flex-col gap-space-1"
    >
      {options.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          checked={value.selected.includes(option.value)}
          disabled={disabled}
          containerClassName="min-h-6"
          onCheckedChange={(checked) => {
            if (disabled) return;
            onChange({
              ...value,
              selected:
                checked === true
                  ? [...value.selected, option.value]
                  : value.selected.filter((item) => item !== option.value),
            });
          }}
        />
      ))}
      {allowCustom && (
        <div className="flex min-h-6 min-w-0 items-center gap-space-2">
          <Checkbox
            {...customLabelProps}
            checked={customSelected}
            disabled={disabled}
            onCheckedChange={(checked) => selectCustom(checked === true)}
          />
          {customInput}
        </div>
      )}
    </div>
  );
}
