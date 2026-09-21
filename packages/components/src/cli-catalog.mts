import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  componentExports,
  ComponentSourceError,
} from './cli-component-exports.mts';
import { storyTags } from './cli-story-tags.mts';

export function buildCatalog(root: string) {
  const componentsRoot = path.join(root, 'src/components');
  const storiesRoot = path.join(root, 'src/stories');
  function relative(file: string) {
    return path.relative(root, file).split(path.sep).join('/');
  }

  function sourceFiles(directory: string): string[] {
    return fs
      .readdirSync(directory, { withFileTypes: true })
      .flatMap((entry) => {
        if (entry.name.startsWith('__')) return [];
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) return sourceFiles(file);
        return /\.(ts|tsx)$/.test(file) && !/\.(test|stories)\.tsx?$/.test(file)
          ? [relative(file)]
          : [];
      });
  }

  function catalog() {
    const keywordsByStory = new Map<string, string>();
    const entries = fs
      .readdirSync(componentsRoot, { withFileTypes: true })
      .filter(
        (entry) =>
          /^[A-Z]/.test(entry.name) &&
          (entry.isDirectory() || /\.tsx?$/.test(entry.name))
      )
      .map((entry) => {
        const name = entry.name.replace(/\.tsx?$/, '');
        const source = path.join(componentsRoot, entry.name);
        const entrypoint = entry.isDirectory()
          ? ['index.ts', 'index.tsx', `${name}.tsx`, `${name}.ts`]
              .map((file) => path.join(source, file))
              .find((file) => fs.existsSync(file))
          : source;
        if (!entrypoint) {
          throw new ComponentSourceError(`No entry point found for ${name}.`);
        }
        return {
          name,
          entrypoint,
          sourceFiles: entry.isDirectory()
            ? sourceFiles(source)
            : [relative(source)],
        };
      });
    // CodeLite is a public direct import within the Code family.
    const codeLite = path.join(componentsRoot, 'Code/CodeLite.tsx');
    if (fs.existsSync(codeLite)) {
      entries.push({
        name: 'CodeLite',
        entrypoint: codeLite,
        sourceFiles: [relative(codeLite)],
      });
    }
    return entries
      .flatMap(({ name: family, entrypoint, sourceFiles }) => {
        const importPath = relative(entrypoint)
          .replace(/^src\/components\//, '@langchain/macaw-components/')
          .replace(/\.tsx?$/, '')
          .replace(/\/index$/, '');
        return componentExports(entrypoint, family, root).map(
          ({ name, exportName }) => {
            const story = [name, family]
              .flatMap((name) => [
                path.join(path.dirname(entrypoint), `${name}.stories.tsx`),
                path.join(componentsRoot, family, `${name}.stories.tsx`),
                path.join(storiesRoot, `${name}.stories.tsx`),
              ])
              .find((file) => fs.existsSync(file));
            if (story && !keywordsByStory.has(story)) {
              keywordsByStory.set(story, storyTags(story).join(', '));
            }
            return {
              name,
              family,
              keywords: story ? (keywordsByStory.get(story) ?? '') : '',
              importPath,
              importStatement: `import ${exportName === 'default' ? name : `{ ${name} }`} from '${importPath}';`,
              sourceFiles: sourceFiles.sort(),
              stories: story ? [relative(story)] : [],
            };
          }
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  return catalog();
}
