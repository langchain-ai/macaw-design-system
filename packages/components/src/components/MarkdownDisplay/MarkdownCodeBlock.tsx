import { resolveCodeLanguage } from '../Code/codeLanguages';
import { CodeLite } from '../Code/CodeLite';

interface MarkdownCodeBlockProps {
  code: string;
  language?: string;
  codeOverflow?: 'wrap' | 'scroll';
}

const getCodeLanguage = (language: string) => {
  const resolved = resolveCodeLanguage(language);
  if (resolved === 'javascript') return 'typescript';
  if (resolved === 'markdown') return 'plaintext';
  return resolved ?? 'plaintext';
};

/** Lightweight read-only adapter for fenced Markdown code blocks. */
export function MarkdownCodeBlock({
  code,
  language = 'text',
  codeOverflow = 'wrap',
}: MarkdownCodeBlockProps) {
  return (
    <CodeLite
      value={code}
      language={getCodeLanguage(language)}
      variant="block"
      label={language || 'text'}
      showGutter={false}
      wrapLines={codeOverflow === 'wrap'}
    />
  );
}
