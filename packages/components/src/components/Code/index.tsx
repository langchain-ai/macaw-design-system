import { useMemo, useState } from 'react';

import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

import { useColorScheme } from '../../hooks/useColorScheme';
import { cn } from '../../utils/cn';
import { getNonce } from '../../utils/csp-nonce';
import { useCodeMirror } from '../../utils/useCodeMirror';
import { useZIndex } from '../../utils/useZIndex';
import zIndices from '../../utils/zIndices';
import { Banner } from '../Banner';
import { Button } from '../Button';
import { CopyButton } from '../CopyButton';
import { ErrorBoundary } from '../ErrorBoundary';
import { PlainTextEditor } from '../PlainTextEditor';
import {
  getLanguageExtension,
  getSyntaxTheme,
  useEditorTheme,
} from './Code.utils';
import { MAX_CODE_LENGTH } from './constants';
import { getImageReplacerExtensions } from './ImageReplacerExtension';
import type { CodeLanguageType } from './types';

/** Props for the syntax-highlighted CodeMirror block. */
export interface CodeProps {
  language: CodeLanguageType;
  extensions?: Extension[];
  value: string | undefined;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  height?: string;
  maxHeight?: string;
  omitMaxHeight?: boolean;
  width?: string;
  fontSize?: string;
  placeholder?: string;
  showCopyButton?: boolean;
  testId?: string;
  variant?: 'plain' | 'full';
  onCreateEditor?: (view: EditorView) => void;
  converterExtensions?: Extension[];
}

/**
 * Renders syntax-highlighted code with optional editing and copy support.
 *
 * Import directly from `@langchain/macaw-components/Code` so the CodeMirror
 * dependency is only loaded by surfaces that use it.
 */
export const Code = ({
  value,
  readOnly,
  onChange,
  autoFocus,
  placeholder,
  language,
  extensions,
  converterExtensions,
  height,
  maxHeight,
  omitMaxHeight,
  width,
  fontSize,
  onCreateEditor,
  variant = 'full',
  testId,
  showCopyButton,
}: CodeProps) => {
  const cm = useCodeMirror();
  const { isDarkMode } = useColorScheme();
  const copyButtonZIndex = useZIndex(zIndices.floatingBar);

  const [ignoreWarning, setIgnoreWarning] = useState(false);

  const lineCount = value?.split('\n').length ?? 0;

  // Stable CM-derived values — memoized so StateField/ViewPlugin instances are
  // created once and not recreated on every render (which resets editor state).
  const imageReplacerExtensions = useMemo(
    () => (cm ? getImageReplacerExtensions(cm) : null),
    [cm]
  );
  const editorTheme = useEditorTheme(cm, { variant });
  const langExt = useMemo(
    () => (cm ? getLanguageExtension(cm, language) : null),
    [cm, language]
  );
  const syntaxTheme = useMemo(
    () => (cm ? getSyntaxTheme(cm, isDarkMode) : null),
    [cm, isDarkMode]
  );

  const nonce = getNonce();

  const mExtensions = useMemo(() => {
    if (!cm || !imageReplacerExtensions || !langExt || !editorTheme) return [];
    const { keymap, defaultKeymap, EditorView } = cm;
    const { decorationStateField, imageReplacerPlugin } =
      imageReplacerExtensions;
    return [
      keymap.of([{ key: 'Mod-Enter', run: () => true }, ...defaultKeymap]),
      langExt.language,
      ...(extensions ?? []),
      // YAML folding blocks rendering for large files, so cap it at 500 lines.
      ...(lineCount <= 500
        ? (converterExtensions ?? langExt.extensions ?? [])
        : []),
      imageReplacerPlugin,
      decorationStateField,
      EditorView.lineWrapping,
      editorTheme,
      ...(readOnly ? [EditorView.editable.of(false)] : []),
      ...(nonce ? [EditorView.cspNonce.of(nonce)] : []),
    ];
    // extensions/converterExtensions are caller-provided arrays. Include them
    // directly so changes propagate.
  }, [
    cm,
    imageReplacerExtensions,
    langExt,
    editorTheme,
    extensions,
    converterExtensions,
    lineCount,
    readOnly,
    nonce,
  ]);

  if (value == null) return null;

  // Avoid mounting CodeMirror by default when style recomputation could block rendering.
  if (lineCount > MAX_CODE_LENGTH && !ignoreWarning)
    return (
      <Banner
        intent="warning"
        action={
          <Button
            variant="underlined"
            color="secondary"
            size="sm"
            onClick={() => setIgnoreWarning(true)}
          >
            Open anyway
          </Button>
        }
      >
        This content might be too long to display in the editor.
      </Banner>
    );

  if (!cm || !syntaxTheme) {
    return (
      <div
        data-testid={testId}
        className={cn('group relative text-xs', height && 'h-full')}
      >
        <PlainTextEditor
          value={value}
          readOnly={true}
          placeholder={placeholder}
          className={cn(
            'font-mono text-xs',
            height && 'h-full overflow-auto',
            maxHeight && !omitMaxHeight && `max-h-[${maxHeight}]`
          )}
        />
      </div>
    );
  }

  const { CodeMirror } = cm;

  return (
    <div
      data-testid={testId}
      className={cn('group relative text-xs', height && 'h-full')}
    >
      <ErrorBoundary fallback={() => <div>Error showing code</div>}>
        <CodeMirror
          value={value}
          readOnly={readOnly}
          autoFocus={autoFocus}
          placeholder={placeholder}
          height={height}
          maxHeight={omitMaxHeight ? undefined : (maxHeight ?? '50vh')}
          width={width}
          style={{
            fontSize,
            backgroundColor: 'var(--bg-surface-level-2)',
            borderRadius: '8px',
            cursor: readOnly ? 'default' : 'text',
            ...(height ? { height } : {}),
            ...(width ? { width } : {}),
          }}
          extensions={mExtensions}
          onCreateEditor={onCreateEditor}
          onChange={(code) => {
            if (!readOnly) {
              onChange?.(code);
            }
          }}
          theme={syntaxTheme}
          basicSetup={{
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            defaultKeymap: false,
            ...(variant === 'plain' && {
              lineNumbers: false,
              highlightSelectionMatches: false,
            }),
          }}
        />
      </ErrorBoundary>
      {showCopyButton && value && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-1 top-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ zIndex: copyButtonZIndex }}
        >
          <CopyButton copy={value} variant="icon" />
        </div>
      )}
    </div>
  );
};
