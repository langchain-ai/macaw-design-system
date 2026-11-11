import { isValidElement } from 'react';

import { FilePlusIcon } from '@phosphor-icons/react/dist/ssr/FilePlus';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { FolderOpenIcon } from '@phosphor-icons/react/dist/ssr/FolderOpen';
import { ListChecksIcon } from '@phosphor-icons/react/dist/ssr/ListChecks';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TerminalIcon } from '@phosphor-icons/react/dist/ssr/Terminal';

import { ChatPlan } from '../ChatPlan';
import { CodeLite, type CodeLiteCodeProps } from '../Code/CodeLite';
import { Text } from '../Text';
import type { ChatThreadToolRenderer } from './ChatThread.types';
import { isRecord } from './messages';
import { planItems } from './toChatThread';

function args(value: unknown) {
  return isRecord(value) ? value : {};
}

function text(value: unknown) {
  return typeof value === 'string' && value ? value : undefined;
}

function splitLines(value: string) {
  const lines = value.split('\n');
  // A trailing newline ends the last line rather than starting a new one.
  if (lines.at(-1) === '') lines.pop();
  return lines;
}

function lines(value: string | undefined) {
  return value ? splitLines(value).length : 0;
}

/** Bounds the line diff so a huge edit can't stall rendering. */
const MAX_DIFF_LINES = 2_000;

/** Lines added and removed, from the longest common subsequence of lines. */
function lineChanges(before: string, after: string) {
  const a = splitLines(before);
  const b = splitLines(after);
  if (a.length * b.length > MAX_DIFF_LINES * MAX_DIFF_LINES) {
    return { added: b.length, removed: a.length };
  }
  let previous = Array.from({ length: b.length + 1 }, () => 0);
  for (let i = 1; i <= a.length; i += 1) {
    const current = Array.from({ length: b.length + 1 }, () => 0);
    for (let j = 1; j <= b.length; j += 1) {
      current[j] =
        a[i - 1] === b[j - 1]
          ? previous[j - 1] + 1
          : Math.max(previous[j], current[j - 1]);
    }
    previous = current;
  }
  const common = previous[b.length];
  return { added: b.length - common, removed: a.length - common };
}

const EXTENSION_LANGUAGES: Record<string, CodeLiteCodeProps['language']> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'typescript',
  jsx: 'typescript',
  mjs: 'typescript',
  cjs: 'typescript',
  py: 'python',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
};

function languageFor(path: string | undefined): CodeLiteCodeProps['language'] {
  const extension = path?.split('.').at(-1)?.toLowerCase();
  return (extension && EXTENSION_LANGUAGES[extension]) || 'plaintext';
}

function icon(Icon: typeof TerminalIcon) {
  return <Icon size={12} weight="regular" />;
}

function DiffStat({ added, removed }: { added: number; removed: number }) {
  return (
    <Text as="span" variant="xs" color="tertiary" className="tabular-nums">
      <span className="text-success-secondary">+{added}</span>{' '}
      <span className="text-error-secondary">−{removed}</span>
    </Text>
  );
}

/**
 * Presentations for the built-in tools of LangChain deep agents: the virtual
 * filesystem, shell execution, and planning. `LangGraphChat` and `ChatThread`
 * use them by default; pass `tools` to add or override presentations.
 */
export const deepAgentTools: Record<string, ChatThreadToolRenderer> = {
  ls: ({ args: input }) => ({
    label: 'List files',
    icon: icon(FolderOpenIcon),
    summary: text(args(input).path) ?? '/',
  }),
  read_file: ({ args: input }) => ({
    label: 'Read',
    icon: icon(FileTextIcon),
    summary: text(args(input).file_path),
  }),
  write_file: ({ args: input }) => {
    const path = text(args(input).file_path);
    const content = text(args(input).content);
    return {
      label: 'Write',
      icon: icon(FilePlusIcon),
      summary: path,
      meta: content ? <DiffStat added={lines(content)} removed={0} /> : null,
      children: content ? (
        <CodeLite
          value={content}
          language={languageFor(path)}
          variant="block"
          label={path}
        />
      ) : undefined,
    };
  },
  edit_file: ({ args: input }) => {
    const { file_path, old_string, new_string } = args(input);
    const path = text(file_path);
    const before = typeof old_string === 'string' ? old_string : undefined;
    const after = typeof new_string === 'string' ? new_string : undefined;
    return {
      label: 'Edit',
      icon: icon(PencilSimpleIcon),
      summary: path,
      meta:
        before !== undefined && after !== undefined ? (
          <DiffStat {...lineChanges(before, after)} />
        ) : null,
      children:
        before !== undefined && after !== undefined ? (
          <CodeLite
            variant="diff"
            oldString={before}
            newString={after}
            fileName={path}
          />
        ) : undefined,
    };
  },
  glob: ({ args: input }) => ({
    label: 'Find files',
    icon: icon(MagnifyingGlassIcon),
    summary: text(args(input).pattern),
  }),
  grep: ({ args: input }) => ({
    label: 'Search',
    icon: icon(MagnifyingGlassIcon),
    summary: text(args(input).pattern),
  }),
  execute: ({ args: input, result, error }) => {
    const output = text(result) ?? text(error);
    return {
      label: 'Run',
      icon: icon(TerminalIcon),
      summary: text(args(input).command),
      children: output ? (
        <CodeLite
          value={output}
          language="plaintext"
          variant="block"
          label="Output"
        />
      ) : undefined,
    };
  },
  write_todos: ({ args: input }) => {
    const items = planItems(args(input).todos);
    const done = items.filter((item) => item.status === 'completed').length;
    return {
      label: 'Update plan',
      icon: icon(ListChecksIcon),
      summary: items.length ? `${done} of ${items.length} done` : null,
      // The plan as it stood after this update.
      children: items.length ? (
        <ChatPlan items={items} defaultExpanded />
      ) : undefined,
    };
  },
};

/** One line naming a tool call, such as "Search · retrieval", for live status. */
export function describeToolCall(
  name: string,
  input: unknown,
  tools: Record<string, ChatThreadToolRenderer>
) {
  const renderer = tools[name];
  const presentation = renderer?.({
    id: name,
    name,
    status: 'running',
    args: input,
  });
  if (presentation && !isValidElement(presentation)) {
    const label = presentation.label ?? name;
    return typeof presentation.summary === 'string'
      ? `${label} · ${presentation.summary}`
      : label;
  }
  return name;
}
