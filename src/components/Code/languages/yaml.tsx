import {
  LRLanguage,
  LanguageSupport,
  delimitedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
} from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { parser as yamlParser } from '@lezer/yaml';

export const yamlLanguage = new LanguageSupport(
  LRLanguage.define({
    name: 'yaml',
    parser: yamlParser.configure({
      props: [
        indentNodeProp.add({
          Stream: (cx) => {
            for (
              let before = cx.node.resolve(cx.pos, -1) as SyntaxNode | null;
              before && before.to >= cx.pos;
              before = before.parent
            ) {
              if (
                before.name == 'BlockLiteralContent' &&
                before.from < before.to
              )
                return cx.baseIndentFor(before);
              if (before.name == 'BlockLiteral')
                return cx.baseIndentFor(before) + cx.unit;
              if (
                before.name == 'BlockSequence' ||
                before.name == 'BlockMapping'
              )
                return cx.column(before.from, 1);
              if (before.name == 'QuotedLiteral') return null;
              if (before.name == 'Literal') {
                const col = cx.column(before.from, 1);
                if (col == cx.lineIndent(before.from, 1)) return col; // Start on own line
                if (before.to > cx.pos) return null;
              }
            }
            return null;
          },
          FlowMapping: delimitedIndent({ closing: '}' }),
          FlowSequence: delimitedIndent({ closing: ']' }),
        }),
        foldNodeProp.add({
          'FlowMapping FlowSequence': foldInside,
          'Item Pair BlockLiteral': (node, state) => {
            // Only applies when running with EditorLite
            if (state == null) return { from: node.from, to: node.to };
            return { from: state.doc.lineAt(node.from).to, to: node.to };
          },
        }),
      ],
    }),
    languageData: {
      commentTokens: { line: '#' },
      indentOnInput: /^\s*[\]}]$/,
    },
  })
);
