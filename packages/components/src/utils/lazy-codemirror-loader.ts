/**
 * Lazy loader for CodeMirror and related packages.
 * Avoids loading @codemirror/*, @uiw/react-codemirror, and @lezer/* on initial
 * page load.
 *
 * Usage:
 *   - Call loadCodeMirror() early (e.g. in App.tsx) to kick off loading in the background.
 *   - Use the useCodeMirror() hook in components — returns CMBundle | null.
 *     null means not yet loaded; components should render a fallback (or null).
 *   - Never import @codemirror/* at the top level outside this file.
 */

import type * as CmCommands from '@codemirror/commands';
import type * as CmLangJs from '@codemirror/lang-javascript';
import type * as CmLangJson from '@codemirror/lang-json';
import type * as CmLangMarkdown from '@codemirror/lang-markdown';
import type * as CmLangPython from '@codemirror/lang-python';
import type * as CmLanguage from '@codemirror/language';
import type * as CmLegacyRuby from '@codemirror/legacy-modes/mode/ruby';
import type * as CmLegacyShell from '@codemirror/legacy-modes/mode/shell';
import type * as CmLint from '@codemirror/lint';
import type * as CmState from '@codemirror/state';
import type * as CmView from '@codemirror/view';
import type * as LezerCommon from '@lezer/common';
import type * as LezerHighlight from '@lezer/highlight';
import type * as LezerYaml from '@lezer/yaml';
import type * as TokyoDay from '@uiw/codemirror-theme-tokyo-night-day';
import type * as TokyoStorm from '@uiw/codemirror-theme-tokyo-night-storm';
import type ReactCodeMirror from '@uiw/react-codemirror';

export type CMBundle = {
  // Core
  CodeMirror: typeof ReactCodeMirror;

  // Commands
  defaultKeymap: typeof CmCommands.defaultKeymap;

  // Language
  LanguageSupport: typeof CmLanguage.LanguageSupport;
  StreamLanguage: typeof CmLanguage.StreamLanguage;
  LRLanguage: typeof CmLanguage.LRLanguage;
  delimitedIndent: typeof CmLanguage.delimitedIndent;
  foldEffect: typeof CmLanguage.foldEffect;
  foldService: typeof CmLanguage.foldService;
  foldNodeProp: typeof CmLanguage.foldNodeProp;
  foldable: typeof CmLanguage.foldable;
  indentNodeProp: typeof CmLanguage.indentNodeProp;
  syntaxTree: typeof CmLanguage.syntaxTree;
  syntaxTreeAvailable: typeof CmLanguage.syntaxTreeAvailable;

  // State
  EditorState: typeof CmState.EditorState;
  StateEffect: typeof CmState.StateEffect;
  StateField: typeof CmState.StateField;
  RangeSetBuilder: typeof CmState.RangeSetBuilder;

  // View
  Decoration: typeof CmView.Decoration;
  EditorView: typeof CmView.EditorView;
  ViewPlugin: typeof CmView.ViewPlugin;
  WidgetType: typeof CmView.WidgetType;
  keymap: typeof CmView.keymap;

  // Lint
  lintGutter: typeof CmLint.lintGutter;
  linter: typeof CmLint.linter;

  // Themes
  tokyoNightDayInit: typeof TokyoDay.tokyoNightDayInit;
  tokyoNightStormInit: typeof TokyoStorm.tokyoNightStormInit;

  // Lezer
  lezerHighlightTags: typeof LezerHighlight.tags;
  lezerYamlParser: typeof LezerYaml.parser;
  lezerTagHighlighter: typeof LezerHighlight.tagHighlighter;
  lezerHighlighTree: typeof LezerHighlight.highlightTree;
  lezerCommon: typeof LezerCommon;

  // Languages
  langJson: typeof CmLangJson.json;
  langJavascript: typeof CmLangJs.javascript;
  langPython: typeof CmLangPython.python;
  langMarkdown: typeof CmLangMarkdown.markdown;
  legacyModeShell: typeof CmLegacyShell.shell;
  legacyModeRuby: typeof CmLegacyRuby.ruby;
};

let bundle: CMBundle | null = null;
let loadPromise: Promise<CMBundle> | null = null;

export function loadCodeMirror(): Promise<CMBundle> {
  if (bundle) return Promise.resolve(bundle);
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all([
    import('@uiw/react-codemirror'),
    import('@codemirror/commands'),
    import('@codemirror/language'),
    import('@codemirror/state'),
    import('@codemirror/view'),
    import('@codemirror/lint'),
    import('@uiw/codemirror-theme-tokyo-night-day'),
    import('@uiw/codemirror-theme-tokyo-night-storm'),
    import('@lezer/highlight'),
    import('@lezer/yaml'),
    import('@lezer/common'),
    import('@codemirror/lang-json'),
    import('@codemirror/lang-javascript'),
    import('@codemirror/lang-python'),
    import('@codemirror/lang-markdown'),
    import('@codemirror/legacy-modes/mode/shell'),
    import('@codemirror/legacy-modes/mode/ruby'),
  ])
    .then(
      ([
        cmCore,
        cmCommands,
        cmLanguage,
        cmState,
        cmView,
        cmLint,
        tokyoDay,
        tokyoStorm,
        lezerHighlight,
        lezerYaml,
        lezerCommonModule,
        cmLangJson,
        cmLangJs,
        cmLangPython,
        cmLangMarkdown,
        cmLegacyShell,
        cmLegacyRuby,
      ]): CMBundle => {
        bundle = {
          CodeMirror: cmCore.default,
          defaultKeymap: cmCommands.defaultKeymap,
          LanguageSupport: cmLanguage.LanguageSupport,
          StreamLanguage: cmLanguage.StreamLanguage,
          LRLanguage: cmLanguage.LRLanguage,
          delimitedIndent: cmLanguage.delimitedIndent,
          foldEffect: cmLanguage.foldEffect,
          foldService: cmLanguage.foldService,
          foldNodeProp: cmLanguage.foldNodeProp,
          foldable: cmLanguage.foldable,
          indentNodeProp: cmLanguage.indentNodeProp,
          syntaxTree: cmLanguage.syntaxTree,
          syntaxTreeAvailable: cmLanguage.syntaxTreeAvailable,
          EditorState: cmState.EditorState,
          StateEffect: cmState.StateEffect,
          StateField: cmState.StateField,
          RangeSetBuilder: cmState.RangeSetBuilder,
          Decoration: cmView.Decoration,
          EditorView: cmView.EditorView,
          ViewPlugin: cmView.ViewPlugin,
          WidgetType: cmView.WidgetType,
          keymap: cmView.keymap,
          lintGutter: cmLint.lintGutter,
          linter: cmLint.linter,
          tokyoNightStormInit: tokyoStorm.tokyoNightStormInit,
          tokyoNightDayInit: tokyoDay.tokyoNightDayInit,
          lezerHighlightTags: lezerHighlight.tags,
          lezerTagHighlighter: lezerHighlight.tagHighlighter,
          lezerHighlighTree: lezerHighlight.highlightTree,
          lezerYamlParser: lezerYaml.parser,
          lezerCommon: lezerCommonModule,
          langJson: cmLangJson.json,
          langJavascript: cmLangJs.javascript,
          langPython: cmLangPython.python,
          langMarkdown: cmLangMarkdown.markdown,
          legacyModeShell: cmLegacyShell.shell,
          legacyModeRuby: cmLegacyRuby.ruby,
        };
        return bundle;
      }
    )
    .catch((err) => {
      loadPromise = null;
      throw err;
    });

  return loadPromise;
}

/** Returns the bundle synchronously if already loaded, otherwise null. */
export function getCodeMirror(): CMBundle | null {
  return bundle;
}
