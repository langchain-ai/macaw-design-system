export type CodeLanguageType =
  | 'yaml'
  | 'json'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'shell'
  | 'markdown';

export type SyntaxHighlighterRow = {
  type: string;
  tagName: string;
  children: SyntaxHighlighterRow[];
  properties: Record<string, unknown>;
  value?: string;
};
