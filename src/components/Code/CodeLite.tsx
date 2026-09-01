import { type ReactNode, memo, useEffect, useRef, useState } from 'react';

import { TableVirtuoso } from 'react-virtuoso';

import { CaretDownIcon } from '../../icons/PaddedPhosphorIcons';
import { cn } from '../../utils/cn';
import { useCodeMirror } from '../../utils/useCodeMirror';
import {
  type ParsedFile,
  convertFile,
  getVisibleLines,
  parseFile,
} from './CodeLite.utils';
import type { LANGUAGES } from './languages/languages';

export interface CodeLiteProps {
  value: string | undefined;
  language: keyof typeof LANGUAGES;
  virtualize?: boolean;
  className?: string;
  children?: ReactNode;
  showGutter?: boolean;
  wrapLines?: boolean;
  highlightText?: string;
}

/**
 * The preferred component for read-only syntax-highlighted code. It avoids
 * mounting a full CodeMirror editor, making it more performant when rendering
 * multiple code blocks, while retaining folding and optional virtualization.
 * Use `Code` only when editing or custom CodeMirror extensions are required.
 */
export const CodeLite = memo((props: CodeLiteProps) => {
  const cm = useCodeMirror();
  const reqCount = useRef(0);
  const [parse, setParse] = useState<{
    id: number;
    data: Awaited<ReturnType<typeof parseFile>> | null;
    error: unknown | null;
  }>({ id: -1, data: null, error: null });

  const mountedRef = useRef(true);
  useEffect(() => () => void (mountedRef.current = false), []);

  useEffect(() => {
    if (!cm) return;

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

  const data = parse.data ?? convertFile(props.value);

  const [foldIdx, setFoldIdx] = useState<Set<number>>(new Set());

  const visibleLines = getVisibleLines(data, foldIdx);
  const showGutter = props.showGutter ?? true;
  const wrapLines = props.wrapLines ?? true;

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
        <td className="select-none py-0 align-top">
          <div className="flex items-center justify-between gap-space-1 whitespace-pre font-mono text-quaternary">
            <span className="min-w-8 pl-2.5 text-right">{line.n}</span>

            {line.fold ? (
              <button
                type="button"
                aria-expanded={!foldIdx.has(line.n)}
                onClick={() => toggleFold(line.n)}
                className="-rotate-90 transition-transform aria-expanded:rotate-0"
              >
                <CaretDownIcon aria-hidden size={16} weight="bold" />
              </button>
            ) : (
              <span className="size-4" />
            )}
          </div>
        </td>
      )}

      <td
        className={cn(
          'px-1.5 py-0 font-mono',
          wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre'
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
                    className="rounded-xs bg-brand-subtle text-brand-primary"
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
          <button
            type="button"
            className="rounded-xs border border-subtle bg-surface-level-2 py-px text-xs leading-none text-quaternary transition-colors hover:bg-surface-level-2-hover"
            onClick={() => toggleFold(line.n)}
          >
            <span className="-mx-0.5">...</span>
          </button>
        )}
      </td>
    </>
  );

  const className = cn('font-mono text-xs', props.className);

  if (!props.virtualize) {
    return (
      <>
        <table
          className={cn(
            'w-fit border-spacing-0 [overflow-anchor:none]',
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
        {props.children}
      </>
    );
  }

  return (
    <>
      <TableVirtuoso
        data={visibleLines}
        className={className}
        itemContent={itemContent}
      />
      {props.children}
    </>
  );
});
