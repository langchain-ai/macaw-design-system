import { useMemo } from 'react';

import * as YAML from 'yaml';

import type { TreeIndentContext } from '@codemirror/language';
import type { Extension, StateEffect } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';

import type { CMBundle } from '../../utils/lazy-codemirror-loader';
import type { CodeLanguageType } from './types';

export type { Extension, StateEffect };

type DataConverter = {
  parse: <T>(value: string) => T;
  stringify: <T>(value: T) => string;
};

const passthroughConverter: DataConverter = {
  parse: (value) => value as never,
  stringify: (value) => String(value),
};

export const DATA_CONVERTERS: Record<CodeLanguageType, DataConverter> = {
  json: {
    parse: (value) => JSON.parse(value),
    stringify: (value) => JSON.stringify(value, null, 2),
  },
  yaml: {
    parse: (value) => YAML.parse(value),
    stringify: (value) =>
      (YAML.stringify(value, { lineWidth: 0 }) as string | undefined)?.slice(
        0,
        -1
      ) ?? '',
  },
  javascript: passthroughConverter,
  typescript: passthroughConverter,
  python: passthroughConverter,
  shell: passthroughConverter,
  markdown: passthroughConverter,
};

type SyntaxThemeOptions = {
  settings?: {
    background?: string;
  };
};

export function getSyntaxTheme(
  cm: CMBundle,
  isDarkMode: boolean,
  options?: SyntaxThemeOptions
) {
  return isDarkMode
    ? cm.tokyoNightStormInit({
        ...(options?.settings ? { settings: options.settings } : {}),
        styles: [{ tag: cm.lezerHighlightTags.content, color: '#9ece6a' }],
      })
    : cm.tokyoNightDayInit({
        ...(options?.settings ? { settings: options.settings } : {}),
        styles: [{ tag: cm.lezerHighlightTags.content, color: '#587539' }],
      });
}

// These helpers require the non-null bundle returned after CodeMirror loads.

function buildYamlLanguage(cm: CMBundle) {
  const {
    LRLanguage,
    LanguageSupport,
    delimitedIndent,
    foldService,
    indentNodeProp,
    syntaxTree,
    syntaxTreeAvailable,
    lezerYamlParser,
  } = cm;

  const yamlParser = lezerYamlParser.configure({
    props: [
      indentNodeProp.add({
        Stream: (cx: TreeIndentContext) => {
          for (
            let before = cx.node.resolve(cx.pos, -1) as SyntaxNode | null;
            before && before.to >= cx.pos;
            before = before.parent
          ) {
            if (before.name == 'BlockLiteralContent' && before.from < before.to)
              return cx.baseIndentFor(before);
            if (before.name == 'BlockLiteral')
              return cx.baseIndentFor(before) + cx.unit;
            if (before.name == 'BlockSequence' || before.name == 'BlockMapping')
              return cx.column(before.from, 1);
            if (before.name == 'QuotedLiteral') return null;
            if (before.name == 'Literal') {
              const col = cx.column(before.from, 1);
              if (col == cx.lineIndent(before.from, 1)) return col;
              if (before.to > cx.pos) return null;
            }
          }
          return null;
        },
        FlowMapping: delimitedIndent({ closing: '}' }),
        FlowSequence: delimitedIndent({ closing: ']' }),
      }),
    ],
  });

  const yamlLanguage = LRLanguage.define({
    name: 'yaml',
    parser: yamlParser,
    languageData: {
      commentTokens: { line: '#' },
      indentOnInput: /^\s*[\]}]$/,
    },
  });

  const language = new LanguageSupport(yamlLanguage);
  const extensions: Extension[] = [
    foldService.of((state, from, to) => {
      void from;
      const tree = syntaxTreeAvailable(state)
        ? syntaxTree(state)
        : yamlParser.parse(state.doc.toString());
      if (tree.length < to) return null;

      const end = tree.resolveInner(to, 1);
      if (end.node.type.name === 'Pair') {
        return { from: to, to: end.node.to };
      }

      return null;
    }),
  ];

  return { language, extensions };
}

export function getLanguageExtension(
  cm: CMBundle,
  language: CodeLanguageType
): { language: Extension; extensions?: Extension[] } {
  const {
    langJson,
    langJavascript,
    langPython,
    langMarkdown,
    StreamLanguage,
    legacyModeShell,
  } = cm;

  if (language === 'yaml') return buildYamlLanguage(cm);
  if (language === 'json') return { language: langJson() };
  if (language === 'javascript') return { language: langJavascript() };
  if (language === 'typescript')
    return { language: langJavascript({ typescript: true }) };
  if (language === 'python') return { language: langPython() };
  if (language === 'shell')
    return { language: StreamLanguage.define(legacyModeShell) };
  return { language: langMarkdown() };
}

export const foldAllExceptRoot = (cm: CMBundle) => (view: EditorView) => {
  const { foldEffect, foldable } = cm;
  const { state } = view;
  const effects: Array<StateEffect<unknown>> = [];
  for (let pos = 0; pos < state.doc.length; ) {
    const line = view.lineBlockAt(pos);
    let range = foldable(state, line.from, line.to);

    // avoid root node
    if (range && range.from + range.to === state.doc.length) {
      range = null;
    }

    if (range) effects.push(foldEffect.of(range));
    pos = (range ? view.lineBlockAt(range.to) : line).to + 1;
  }
  if (effects.length) {
    view.dispatch({ effects });
  }
  return !!effects.length;
};

export const useEditorTheme = (
  cm: CMBundle | null,
  {
    variant,
  }: {
    variant?: 'plain' | 'full';
  }
) => {
  const textQuaternary = 'var(--text-quaternary)';

  return useMemo(() => {
    if (!cm) return null;

    return cm.EditorView.theme({
      '&.cm-editor': {
        backgroundColor: 'transparent',
      },
      '&.cm-focused': {
        outline: 'none',
      },
      green: {
        background: 'green',
      },
      '& .cm-content': {
        padding: '12px',
      },
      '& .cm-line': {
        fontFamily: "'Fira Code', monospace",
        padding: 0,
        overflowAnchor: 'none',
        fontVariantLigatures: 'none',
      },
      '& .cm-gutters.cm-gutters': {
        backgroundColor: 'transparent',
        color: textQuaternary,
        borderRight: 'none',
      },
      '& .cm-lineNumbers': {
        minWidth: '32px',
      },
      '& .cm-lineNumbers .cm-gutterElement': {
        minWidth: '32px',
        padding: '0 4px 0 8px',
      },
      '& .cm-foldGutter': {
        width: '20px',
      },
      '& .cm-foldGutter .cm-gutterElement': {
        padding: '0 2px',
        textAlign: 'center',
      },
      '& .cm-foldGutter span': {
        color: textQuaternary,
        fontSize: '16px',
        lineHeight: '16px',
      },
      '& .cm-foldPlaceholder': {
        backgroundColor: 'var(--bg-surface-level-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xs)',
        color: textQuaternary,
        lineHeight: '1',
        padding: '1px 2px',
      },
      ...(variant === 'plain' && {
        '& .cm-content': {
          padding: '13px',
          paddingLeft: '0px',
        },
      }),
    });
  }, [cm, variant, textQuaternary]);
};
