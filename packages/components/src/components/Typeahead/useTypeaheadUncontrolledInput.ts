import { useEffect } from 'react';

import type {
  TypeaheadMultipleValue,
  TypeaheadSelectedValue,
  TypeaheadSingleValue,
} from './Typeahead.types';

export function useTypeaheadUncontrolledInput<TOption>({
  clearOnBlur,
  controlledInputValue,
  freeSolo,
  getLabel,
  getValue,
  multiple,
  open,
  setUncontrolledInputValue,
  value,
}: {
  clearOnBlur?: boolean;
  controlledInputValue?: string;
  freeSolo: boolean;
  getLabel: (option: TypeaheadSelectedValue<TOption>) => string;
  getValue: (option: TypeaheadSelectedValue<TOption>) => string;
  multiple?: boolean;
  open: boolean;
  setUncontrolledInputValue: (value: string) => void;
  value: TypeaheadSingleValue<TOption> | TypeaheadMultipleValue<TOption>;
}) {
  const singleValue: TypeaheadSingleValue<TOption> = Array.isArray(value)
    ? null
    : value;
  const selectedLabel = singleValue == null ? '' : getLabel(singleValue);
  const selectedKey = singleValue == null ? null : getValue(singleValue);

  // Equivalent options and recreated callbacks must not replace an active query.
  useEffect(() => {
    if (controlledInputValue !== undefined || multiple) return;
    setUncontrolledInputValue(selectedLabel);
  }, [
    controlledInputValue,
    multiple,
    selectedKey,
    selectedLabel,
    setUncontrolledInputValue,
  ]);

  useEffect(() => {
    if (open || controlledInputValue !== undefined) return;
    if (clearOnBlur ?? !freeSolo) {
      setUncontrolledInputValue(multiple ? '' : selectedLabel);
    }
  }, [
    clearOnBlur,
    controlledInputValue,
    freeSolo,
    multiple,
    open,
    selectedLabel,
    setUncontrolledInputValue,
  ]);
}
