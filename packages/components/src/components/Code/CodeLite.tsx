import {
  type ReactNode,
  lazy,
  memo,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

import { TableVirtuoso } from 'react-virtuoso';

import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';

import { CaretDownIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import { useCodeMirror } from '../../utils/useCodeMirror';
import { CopyIconButton } from '../CopyButton';
import { IconButton } from '../IconButton';
import { Text } from '../Text';
import {
  type ParsedFile,
  convertFile,
  getVisibleLines,
  parseFile,
} from './CodeLite.utils';
import { CodeToolbar } from './CodeToolbar';
import type { LANGUAGES } from './languages/languages';

export interface CodeLiteCodeProps {
  value: string | undefined;
  language: keyof typeof LANGUAGES | 'plaintext';
  variant?: 'plain' | 'block';
  label?: string;
  toolbar?: ReactNode;
  virtualize?: boolean;
  className?: string;
  children?: ReactNode;
  showGutter?: boolean;
  wrapLines?: boolean;
  highlightText?: string;
}

export interface CodeLiteDiffProps {
  variant: 'diff';
  oldString: string;
  newString: string;
  fileName?: string;
  className?: string;
  contextLines?: number;
  children?: ReactNode;
}

export type CodeLiteProps = CodeLiteCodeProps | CodeLiteDiffProps;

const LazyCodeLiteDiff = lazy(() =>
  import('./CodeLiteDiff').then((module) => ({ default: module.CodeLiteDiff }))
);

/**
 * The preferred component for read-only syntax-highlighted code. It avoids
 * mounting a full CodeMirror editor, making it more performant when rendering
 * multiple code blocks, while retaining folding and optional virtualization.
 * The diff variant loads the unified diff renderer only when requested.
 * Use `Code` only when editing or custom CodeMirror extensions are required.
 */
export const CodeLite = memo((props: CodeLiteProps) => {
  if (props.variant === 'diff') {
    return (
      <>
        <Suspense
          fallback={
            <Text role="status" variant="xs" color="tertiary">
              Loading changes…
            </Text>
          }
        >
          <LazyCodeLiteDiff {...props} />
        </Suspense>
        {props.children}
      </>
    );
  }

  return <CodeLiteCode {...props} />;
});

function CodeLiteCode(props: CodeLiteCodeProps) {
  const cm = useCodeMirror(props.language !== 'plaintext');
  const reqCount = useRef(0);
  const [parse, setParse] = useState<{
    id: number;
    data: Awaited<ReturnType<typeof parseFile>> | null;
    error: unknown | null;
  }>({ id: -1, data: null, error: null });

  const mountedRef = useRef(true);
  useEffect(() => () => void (mountedRef.current = false), []);

  useEffect(() => {
    if (!cm || props.language === 'plaintext') return;

    const controller = new AbortController();
    const signal = controller.signal;
    const requestId = ++reqCount.current;

    setParse({ id: requestId, data: null, error: null });

    parseFile(cm, props.language, props.value, { signal }).then(
      (data) => {
        if (!mountedRef.current) return;
        setParse((prev) => {
          if (prev.id !== requestId) return prev;
          return { id: requestId, data, error: null };
        });
      },
      (error) => {
        if (!mountedRef.current) return;
        setParse((prev) => {
          if (prev.id !== requestId) return prev;
          return { id: requestId, data: null, error };
        });
      }
    );

    return () => controller.abort();
  }, [cm, props.language, props.value]);

  const data =
    props.language === 'plaintext'
      ? convertFile(props.value)
      : (parse.data ?? convertFile(props.value));

  const [foldIdx, setFoldIdx] = useState<Set<number>>(new Set());

  const visibleLines = getVisibleLines(data, foldIdx);
  const showGutter = props.showGutter ?? true;
  const wrapLines = props.wrapLines ?? true;
  const isBlock = props.variant === 'block';

  const toggleFold = (n: number) => {
    setFoldIdx((prev) => {
      const curr = new Set(prev);
      if (curr.has(n)) curr.delete(n);
      else curr.add(n);
      return curr;
    });
  };

  const itemContent = (_index: number, line: ParsedFile['file'][number]) => (
    <>
      {showGutter && (
        <td
          data-search-ignore=""
          className={cn(
            'py-0 align-top select-none',
            isBlock && wrapLines && 'w-12'
          )}
        >
          <div className="gap-space-1 text-quaternary flex items-center justify-between font-mono whitespace-pre">
            <span className="min-w-8 pl-2.5 text-right">{line.n}</span>

            {line.fold ? (
              <IconButton
                icon={CaretDownIcon}
                label={`${foldIdx.has(line.n) ? 'Expand' : 'Collapse'} code at line ${line.n}`}
                size="xxs"
                variant="plain"
                color="secondary"
                aria-expanded={!foldIdx.has(line.n)}
                onClick={() => toggleFold(line.n)}
                iconWeight="regular"
                iconClassName={cn(
                  'duration-fast transition-transform motion-reduce:transition-none',
                  foldIdx.has(line.n) && '-rotate-90'
                )}
              />
            ) : (
              <span className="size-4" />
            )}
          </div>
        </td>
      )}

      <td
        data-code-line=""
        className={cn(
          'px-1.5 py-0 font-mono',
          wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre',
          isBlock &&
            (wrapLines ? '[overflow-wrap:anywhere]' : '[overflow-wrap:normal]')
        )}
      >
        {line.line.map((token, index) => {
          const tokenText = data.code.slice(token.from, token.to);
          const highlightText = props.highlightText;
          const highlightIndex = highlightText
            ? tokenText.indexOf(highlightText)
            : -1;

          return (
            <span key={index} className={cn(token.classes || 'text-tertiary')}>
              {highlightIndex === -1 || !highlightText ? (
                tokenText
              ) : (
                <>
                  {tokenText.slice(0, highlightIndex)}
                  <span
                    data-code-highlight
                    className="bg-brand-subtle text-brand-primary rounded-xs"
                  >
                    {highlightText}
                  </span>
                  {tokenText.slice(highlightIndex + highlightText.length)}
                </>
              )}
            </span>
          );
        })}

        {line.line.length === 0 && (
          <span className="text-tertiary">{'\n'}</span>
        )}

        {foldIdx.has(line.n) && (
          <IconButton
            icon={DotsThreeIcon}
            iconWeight="regular"
            label={`Show folded lines after line ${line.n}`}
            size="xxs"
            variant="outlined"
            color="secondary"
            className="border-subtle bg-surface-level-2 text-quaternary hover:bg-surface-level-2-hover"
            onClick={() => toggleFold(line.n)}
          />
        )}
      </td>
    </>
  );

  const className = cn('font-mono text-xs', props.className);
  const accessibleLabel = props.label?.trim() || 'Code block';

  const focusClassName =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

  const content = props.virtualize ? (
    <TableVirtuoso
      data={visibleLines}
      className={cn(
        className,
        isBlock && focusClassName,
        isBlock && '[&_table]:!table',
        isBlock && wrapLines && '[&_table]:w-full [&_table]:table-fixed'
      )}
      role={isBlock ? 'region' : undefined}
      aria-label={isBlock ? accessibleLabel : undefined}
      itemContent={itemContent}
    />
  ) : (
    <table
      data-code-lite=""
      className={cn(
        'w-fit border-spacing-0 [overflow-anchor:none]',
        isBlock && '!table',
        isBlock && wrapLines && 'w-full table-fixed',
        className
      )}
    >
      <tbody>
        {visibleLines.map((line, index) => (
          <tr key={index} className="[overflow-anchor:none]">
            {itemContent(index, line)}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!isBlock) {
    return (
      <>
        {content}
        {props.children}
      </>
    );
  }

  return (
    <div className="border-subtle bg-surface-level-1 w-full max-w-full min-w-0 overflow-hidden rounded-lg border">
      {props.toolbar === undefined ? (
        <CodeToolbar
          className="bg-surface-level-1 pl-space-4 pr-space-3 min-h-8"
          language={
            props.label ??
            (props.language === 'plaintext' ? 'text' : props.language)
          }
        >
          <CopyIconButton copy={props.value ?? ''} label="Copy code" />
        </CodeToolbar>
      ) : (
        props.toolbar
      )}
      <div
        role={props.virtualize ? undefined : 'region'}
        aria-label={props.virtualize ? undefined : accessibleLabel}
        tabIndex={props.virtualize ? undefined : 0}
        className={cn(
          'bg-brand-muted p-space-3 min-w-0',
          !props.virtualize && 'overflow-x-auto',
          !props.virtualize && focusClassName
        )}
      >
        {content}
      </div>
      {props.children}
    </div>
  );
}
