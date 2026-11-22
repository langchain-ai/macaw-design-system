import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Foundations } from '../../cli/src/commands.mts';

function section(markdown: string, heading: string) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line === heading);
  if (start < 0)
    throw new Error(`Missing canonical foundation heading: ${heading}`);
  const depth = heading.match(/^#+/)![0].length;
  const end = lines.findIndex(
    (line, index) => index > start && new RegExp(`^#{1,${depth}} `).test(line)
  );
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join('\n')
    .replace(/\n---\s*$/, '')
    .trim();
}

function table(content: string) {
  return content
    .split('\n')
    .filter((line) => line.startsWith('|') && !/^\|[\s:|-]+\|$/.test(line))
    .slice(1)
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
    );
}

export function buildFoundations(root: string): Foundations {
  const design = fs.readFileSync(path.join(root, 'docs/DESIGN.md'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'docs/STYLES.md'), 'utf8');
  const { version } = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8')
  );
  const topics: Foundations['topics'] = {};
  for (const [key, title, document, heading, anchor] of [
    [
      'usage',
      'Semantic styling rules',
      'STYLES',
      '## Usage Rules',
      'usage-rules',
    ],
    [
      'package',
      'Stylesheet and theme setup',
      'DESIGN',
      '## Package contract',
      'package-contract',
    ],
    [
      'surfaces',
      'Surface roles',
      'STYLES',
      '### Surface — `bg-*`',
      'surface--bg-',
    ],
    [
      'spacing',
      'Spacing relationships',
      'STYLES',
      '### Spacing — `space-*`',
      'spacing--space-',
    ],
    [
      'sizes',
      'Family-specific component sizes',
      'STYLES',
      '## Component Sizes',
      'component-sizes',
    ],
    [
      'typography',
      'Typography and labels',
      'DESIGN',
      '## Typography and labels',
      'typography-and-labels',
    ],
    ['icons', 'Icon imports', 'DESIGN', '## Icons', 'icons'],
    [
      'quality',
      'States and verification',
      'DESIGN',
      '## Quality bar',
      'quality-bar',
    ],
  ]) {
    topics[key] = {
      title,
      source: `docs/${document}.md#${anchor}`,
      content: section(document === 'DESIGN' ? design : styles, heading),
    };
  }
  topics.surfaces.roles = table(topics.surfaces.content).map(
    ([utility, purpose]) => ({
      utility: utility.replaceAll('`', ''),
      token: `--${utility.replaceAll('`', '')}`,
      purpose,
    })
  );
  topics.spacing.relationships = table(
    section(styles, '#### Relationship defaults')
  ).map(([relationship, utility]) => ({
    relationship,
    utilities: [...utility.matchAll(/`([^`]+)`/g)].flatMap(([, value]) =>
      value.split(' ')
    ),
  }));
  return {
    schemaVersion: 1,
    packageName: '@langchain/macaw-components',
    version,
    topics,
  };
}
