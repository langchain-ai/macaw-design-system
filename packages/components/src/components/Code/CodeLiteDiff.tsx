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

  const { fileDiff, additions, deletions } = useMemo(() => {
    const name = fileName || 'file';
    const oldFile: FileContents = {
      name,
      contents: withTrailingNewline(oldString),
    };
    const newFile: FileContents = {
      name,
      contents: withTrailingNewline(newString),
    };
    const fileDiff = parseDiffFromFile(
      oldFile,
      newFile,
      contextLines != null ? { context: contextLines } : undefined
    );

    let additions = 0;
    let deletions = 0;
    for (const hunk of fileDiff.hunks) {
      additions += hunk.additionLines;
      deletions += hunk.deletionLines;
    }
    return { fileDiff, additions, deletions };
  }, [oldString, newString, fileName, contextLines]);

  const displayFileName = fileName ? fileName.split('/').pop() : null;
  const hasChanges = fileDiff.hunks.length > 0;

  return (
    <div
      className={cn(
        'border-subtle bg-surface-level-1 w-full min-w-0 overflow-hidden rounded-lg border',
        className
      )}
    >
      <CodeToolbar
        className={cn(
          'bg-surface-level-1 px-space-4',
          hasChanges ? 'min-h-9' : 'min-h-11 border-0'
        )}
        language={
          displayFileName && (
            <span className="gap-space-2 flex min-w-0 items-center">
              <Icon
                icon={FileCodeIcon}
                size="md"
                weight="regular"
                aria-hidden
                className="text-icon-tertiary"
              />
              <span className="min-w-0 break-all">{displayFileName}</span>
            </span>
          )
        }
      >
        {hasChanges ? (
          <>
            <Text
              as="span"
              variant="xs"
              className="text-success-secondary tabular-nums"
            >
              +{additions}
            </Text>
            <Text
              as="span"
              variant="xs"
              className="text-error-secondary tabular-nums"
            >
              -{deletions}
            </Text>
          </>
        ) : (
          <Text as="span" variant="xs" color="tertiary">
            No changes
          </Text>
        )}
      </CodeToolbar>
      {hasChanges && (
        <div className="bg-brand-muted py-space-3 pl-space-3 max-h-64 min-w-0 overflow-auto text-xs">
          <FileDiff
            className="[--diffs-bg:var(--bg-brand-muted)] [--diffs-gap-block:0px] [--diffs-overflow-override:auto]"
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
      )}
    </div>
  );
};
