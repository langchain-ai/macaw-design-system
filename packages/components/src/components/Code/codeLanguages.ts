import type { CodeLanguageType } from './types';

export const CODE_LANGUAGES: {
  value: CodeLanguageType;
  label: string;
  aliases: string[];
}[] = [
  { value: 'plaintext', label: 'Plain text', aliases: ['', 'text', 'txt'] },
  { value: 'python', label: 'Python', aliases: ['py'] },
  { value: 'javascript', label: 'JavaScript', aliases: ['js'] },
  { value: 'typescript', label: 'TypeScript', aliases: ['ts'] },
  { value: 'json', label: 'JSON', aliases: [] },
  { value: 'shell', label: 'Shell', aliases: ['bash', 'sh', 'zsh'] },
  { value: 'yaml', label: 'YAML', aliases: ['yml'] },
  { value: 'markdown', label: 'Markdown', aliases: ['md'] },
];

export function resolveCodeLanguage(
  value: string
): CodeLanguageType | undefined {
  const normalized = value.trim().toLowerCase();
  return CODE_LANGUAGES.find(
    (language) =>
      language.value === normalized || language.aliases.includes(normalized)
  )?.value;
}
