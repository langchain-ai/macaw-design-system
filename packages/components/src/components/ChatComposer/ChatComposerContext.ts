import { createContext, useContext } from 'react';

export interface ChatComposerContextValue {
  disabled: boolean;
  canSubmit: boolean;
  action: 'send' | 'stop';
  submit?: () => void;
  onStop?: () => void;
  onFilesSelected?: (files: File[]) => void;
}

export const ChatComposerContext =
  createContext<ChatComposerContextValue | null>(null);

// Node views render through portals and need input-level editability updates.
export const ChatComposerInputEditableContext = createContext(false);

export function useChatComposerContext() {
  const context = useContext(ChatComposerContext);
  if (!context) {
    throw new Error('ChatComposer parts must be inside a ChatComposer.');
  }
  return context;
}

export function isComposerSubmitKey(event: KeyboardEvent, multiline = false) {
  return (
    event.key === 'Enter' &&
    !event.shiftKey &&
    !event.altKey &&
    !event.isComposing &&
    // Safari can end composition before dispatching the confirming Enter.
    event.keyCode !== 229 &&
    (!multiline || event.metaKey || event.ctrlKey)
  );
}
