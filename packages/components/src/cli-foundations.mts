import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Foundations } from '../../cli/src/commands.mts';

// Sections of the canonical guides served by `macaw foundations <topic>`.
const TOPICS = {
  components: ['DESIGN', '## Components', 'Choosing components'],
  package: ['DESIGN', '## Package contract', 'Stylesheet and theme setup'],
  tokens: ['DESIGN', '## Tokens', 'Semantic token usage'],
  surfaces: ['STYLES', '### Surface — `bg-*`', 'Surface roles'],
  spacing: [
    'STYLES',
    '### Spacing — `space-*`',
    'Spacing scale and relationships',
  ],
  sizes: ['STYLES', '## Component Sizes', 'Component size families'],
  typography: ['DESIGN', '## Typography and labels', 'Typography and labels'],
  icons: ['DESIGN', '## Icons', 'Icon imports'],
  quality: ['DESIGN', '## Quality bar', 'States and verification'],
} as const;

// A section runs until the next heading of the same or a higher level.
function section(markdown: string, heading: string) {
  const lines = markdown.split('\n');
  const start = lines.indexOf(heading);
  if (start < 0) throw new Error(`Missing foundations heading: ${heading}`);
  const level = heading.indexOf(' ');
  let fenced = false;
  const end = lines.findIndex((line, index) => {
    if (line.startsWith('```')) fenced = !fenced;
    return (
      index > start &&
      !fenced &&
      /^#+ /.test(line) &&
      line.indexOf(' ') <= level
    );
  });
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join('\n')
    .replace(/\n---\s*$/, '')
    .trim();
}

// Matches GitHub's heading anchors: lowercase, punctuation removed.
function anchor(heading: string) {
  return heading
    .replace(/^#+ /, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replaceAll(' ', '-');
}

export function buildFoundations(root: string): Foundations {
  const read = (name: string) =>
    fs.readFileSync(path.join(root, 'docs', `${name}.md`), 'utf8');
  const documents = { DESIGN: read('DESIGN'), STYLES: read('STYLES') };
  return Object.fromEntries(
    Object.entries(TOPICS).map(([topic, [document, heading, title]]) => [
      topic,
      {
        title,
        source: `docs/${document}.md#${anchor(heading)}`,
        content: section(documents[document], heading),
      },
    ])
  );
}
