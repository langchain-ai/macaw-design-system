import { useMemo } from 'react';

import { FileCodeIcon } from '@phosphor-icons/react/dist/ssr/FileCode';
import { parseDiffFromFile } from '@pierre/diffs';
import type { FileContents } from '@pierre/diffs';
import { FileDiff } from '@pierre/diffs/react';

import { useColorScheme } from '../../hooks/useColorScheme';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { CodeLiteDiffProps } from './CodeLite';
import { CodeToolbar } from './CodeToolbar';

const DIFF_THEME = { light: 'github-light', dark: 'github-dark' };

const withTrailingNewline = (text: string): string =>
  text.length > 0 && !text.endsWith('\n') ? `${text}\n` : text;

export const CodeLiteDiff = ({
  oldString,
  newString,
  fileName,
  className,
  contextLines,
}: CodeLiteDiffProps) => {
  const { resolvedMode } = useColorScheme();

  const fileDiff = useMemo(() => {
    const name = fileName || 'file';
    const oldFile: FileContents = {
      name,
      contents: withTrailingNewline(oldString),
    };
    const newFile: FileContents = {
      name,
      contents: withTrailingNewline(newString),
    };
    return parseDiffFromFile(
      oldFile,
      newFile,
      contextLines != null ? { context: contextLines } : undefined
    );
  }, [oldString, newString, fileName, contextLines]);

  const { additions, deletions } = useMemo(() => {
    let adds = 0;
    let dels = 0;
    for (const hunk of fileDiff.hunks) {
      adds += hunk.additionLines;
      dels += hunk.deletionLines;
    }
    return { additions: adds, deletions: dels };
  }, [fileDiff]);

  const displayFileName = fileName ? fileName.split('/').pop() : null;

  if (fileDiff.hunks.length === 0) {
    return (
      <Text variant="sm" color="secondary">
        No changes
      </Text>
    );
  }

  return (
    <div
      className={cn(
        'border-subtle bg-surface-level-3 w-full overflow-hidden rounded-md border',
        className
      )}
    >
      {displayFileName && (
        <CodeToolbar
          className="border-0"
          language={
            <span className="gap-space-2 flex min-w-0 items-center">
              <Icon
                icon={FileCodeIcon}
                size="lg"
                weight="regular"
                aria-hidden
                className="text-icon-tertiary"
              />
              <span className="min-w-0 break-all">{displayFileName}</span>
            </span>
          }
        >
          <Text as="span" variant="xs" className="text-success-secondary">
            +{additions}
          </Text>
          <Text as="span" variant="xs" className="text-error-secondary">
            -{deletions}
          </Text>
        </CodeToolbar>
      )}
      <div className="max-h-64 overflow-auto text-xs">
        <FileDiff
          fileDiff={fileDiff}
          disableWorkerPool
          options={{
            diffStyle: 'unified',
            theme: DIFF_THEME,
            themeType: resolvedMode,
            preferredHighlighter: 'shiki-js',
            disableFileHeader: true,
          }}
        />
      </div>
    </div>
  );
};
