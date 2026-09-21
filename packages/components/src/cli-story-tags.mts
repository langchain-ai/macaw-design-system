import * as fs from 'node:fs';

import type { Node } from 'oxc-parser';
import { parseSync } from 'oxc-parser';

export class StorySourceError extends Error {
  readonly code = 'ERR_STORY_SOURCE';
}

// Read component-level CSF tags without importing or executing the story.
export function storyTags(file: string): string[] {
  const parsed = parseSync(file, fs.readFileSync(file, 'utf8'));
  if (parsed.errors.some(({ severity }) => severity === 'Error')) {
    throw new StorySourceError(`Could not parse story metadata from ${file}.`);
  }
  const bindings = new Map<string, Node>();
  let meta: Node | undefined;
  for (const statement of parsed.program.body) {
    if (statement.type === 'ExportDefaultDeclaration') {
      meta = statement.declaration;
    }
    const declaration =
      statement.type === 'ExportNamedDeclaration'
        ? statement.declaration
        : statement;
    if (declaration?.type === 'VariableDeclaration') {
      for (const { id, init } of declaration.declarations) {
        if (id.type === 'Identifier' && init) bindings.set(id.name, init);
      }
    }
  }
  const seen = new Set<Node>();
  while (meta && !seen.has(meta)) {
    seen.add(meta);
    if (meta.type === 'Identifier') {
      meta = bindings.get(meta.name);
    } else if (
      meta.type === 'TSAsExpression' ||
      meta.type === 'TSSatisfiesExpression' ||
      meta.type === 'ParenthesizedExpression'
    ) {
      meta = meta.expression;
    } else {
      break;
    }
  }
  if (meta?.type !== 'ObjectExpression') {
    throw new StorySourceError(`Expected static CSF metadata in ${file}.`);
  }
  const tags = meta.properties.find(
    (property) =>
      property.type === 'Property' &&
      !property.computed &&
      ((property.key.type === 'Identifier' && property.key.name === 'tags') ||
        (property.key.type === 'Literal' && property.key.value === 'tags'))
  );
  if (!tags) return [];
  if (tags.type !== 'Property' || tags.value.type !== 'ArrayExpression') {
    throw new StorySourceError(`Expected a static tags array in ${file}.`);
  }
  const keywords = new Set<string>();
  for (const tag of tags.value.elements) {
    if (tag?.type !== 'Literal' || typeof tag.value !== 'string') {
      throw new StorySourceError(`Expected static string tags in ${file}.`);
    }
    if (tag.value.startsWith('!')) {
      keywords.delete(tag.value.slice(1));
    } else if (
      !['autodocs', 'dev', 'test', 'manifest', 'play-fn', 'test-fn'].includes(
        tag.value
      )
    ) {
      keywords.add(tag.value);
    }
  }
  return [...keywords];
}
