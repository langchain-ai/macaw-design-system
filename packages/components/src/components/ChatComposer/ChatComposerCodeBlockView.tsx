import { useContext } from 'react';
import type { KeyboardEvent } from 'react';

import type { ReactNodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';

import { Code } from '../Code';
import { CODE_LANGUAGES, resolveCodeLanguage } from '../Code/codeLanguages';
import { CodeLanguageSelect } from '../Code/CodeLanguageSelect';
import { CodeToolbar } from '../Code/CodeToolbar';
import type { ComposerCodeBlockAdapter } from './ChatComposerCodeBlockAdapter';
import { moveSelectionOutsideCodeBlock } from './ChatComposerCodeBlockAdapter';
import {
  ChatComposerInputEditableContext,
  isComposerSubmitKey,
  useChatComposerContext,
} from './ChatComposerContext';

export function ComposerCodeBlockView({
  node,
  updateAttributes,
  editor,
  getPos,
  adapter,
}: ReactNodeViewProps & { adapter: ComposerCodeBlockAdapter }) {
  const editable = useContext(ChatComposerInputEditableContext);
  const composer = useChatComposerContext();
  const language =
    typeof node.attrs.language === 'string' ? node.attrs.language : '';
  const resolvedLanguage = resolveCodeLanguage(language);
  const languageLabel =
    CODE_LANGUAGES.find((option) => option.value === resolvedLanguage)?.label ??
    language;

  function onCodeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const view = adapter.view;
    if (
      !view ||
      !(event.target instanceof Node) ||
      !view.contentDOM.contains(event.target) ||
      !editable ||
      !editor.isEditable ||
      view.composing ||
      event.nativeEvent.isComposing ||
      event.nativeEvent.keyCode === 229
    ) {
      return;
    }
    const consume = () => {
      event.preventDefault();
      event.stopPropagation();
    };
    if (composer.submit && isComposerSubmitKey(event.nativeEvent, true)) {
      consume();
      composer.submit();
      return;
    }
    if ((event.metaKey || event.ctrlKey) && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === 'z' || key === 'y') {
        consume();
        if (key === 'y' || event.shiftKey) editor.commands.redo();
        else editor.commands.undo();
        adapter.syncFromComposer();
        editor.view.focus();
      }
      return;
    }
    if (event.altKey) return;

    const position = getPos();
    if (position === undefined) return;
    const { head, empty } = view.state.selection.main;
    const code = view.state.doc;
    if (event.key === 'Enter' && event.shiftKey) {
      consume();
      view.dispatch({
        ...view.state.replaceSelection('\n'),
        userEvent: 'input',
      });
      return;
    }
    if (event.shiftKey) return;
    if (
      event.key === 'Enter' &&
      empty &&
      head === code.length &&
      code.toString().endsWith('\n\n')
    ) {
      consume();
      editor.commands.keyboardShortcut('Enter');
      editor.view.focus();
      return;
    }
    if (event.key === 'Backspace' && empty && code.length === 0) {
      consume();
      editor.commands.setParagraph();
      editor.view.focus();
      return;
    }
    if (
      moveSelectionOutsideCodeBlock(editor, position, view.state, event.key)
    ) {
      consume();
      editor.view.focus();
    }
  }

  return (
    <NodeViewWrapper contentEditable={false} className="my-space-2 min-w-0">
      <div onKeyDownCapture={onCodeKeyDown}>
        <Code
          value={node.textContent}
          language={resolvedLanguage ?? 'plaintext'}
          readOnly={!editable}
          variant="plain"
          showFoldGutter={false}
          ariaLabel={`${languageLabel} code block`}
          fontSize="14px"
          omitMaxHeight
          onUpdate={adapter.forwardUpdate}
          onCreateEditor={(view) => adapter.attach(view)}
          toolbar={
            <CodeToolbar
              language={
                <CodeLanguageSelect
                  value={language}
                  onChange={(value) => {
                    if (editable && editor.isEditable) {
                      updateAttributes({
                        language: value === 'plaintext' ? '' : value,
                      });
                      requestAnimationFrame(() => adapter.focus());
                    }
                  }}
                  disabled={!editable}
                />
              }
            />
          }
        />
      </div>
    </NodeViewWrapper>
  );
}
