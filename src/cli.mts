import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, styleText } from 'node:util';

import {
  componentExports,
  ComponentSourceError,
} from './cli-component-exports.mts';
import { storyTags, StorySourceError } from './cli-story-tags.mts';

const root = fileURLToPath(new URL('../', import.meta.url));
const componentsRoot = path.join(root, 'src/components');
const storiesRoot = path.join(root, 'src/stories');

const HELP = `Discover design-system components.

Usage: pnpm design-system <command>
  list                       Browse components (↑/↓ scroll, q quit)
  search <query>             Find components by name or capability
  inspect <name>             Show import, source files, and stories

Options: --json, --no-pager, --limit <1–100> (search; default 10), --help (-h)
For pipeable JSON: pnpm --silent design-system <command> --json`;

class CliError extends Error {
  readonly code: string;
  readonly suggestions: string[];

  constructor(code: string, message: string, suggestions: string[] = []) {
    super(message);
    this.code = code;
    this.suggestions = suggestions;
  }
}

function relative(file: string) {
  return path.relative(root, file).split(path.sep).join('/');
}

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
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
        throw new CliError(
          'ERR_COMPONENT_SOURCE',
          `No entry point found for ${name}.`
        );
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
        .replace(/^src\//, '@langchain/macaw-components/')
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

type Component = ReturnType<typeof catalog>[number];

function words(value: string) {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) =>
      word.length > 3
        ? word
            .replace(/ies$/, 'y')
            .replace(/(ch|sh|x|z)es$/, '$1')
            .replace(/(?<!s|u|i)s$/, '')
        : word
    );
}

function distance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1)
      );
      diagonal = previous;
    }
  }
  return row[right.length];
}

function search(components: Component[], query: string, limit: number) {
  const queryWords = new Set(
    words(query).filter(
      (word) =>
        ![
          'a',
          'an',
          'and',
          'for',
          'in',
          'of',
          'or',
          'the',
          'to',
          'with',
        ].includes(word)
    )
  );
  const normalized = [...queryWords].join(' ');
  return components
    .map((component) => {
      const name = component.name.toLowerCase();
      const terms = new Set(
        words(`${component.name} ${component.family} ${component.keywords}`)
      );
      let score = [...queryWords].filter((word) => terms.has(word)).length * 8;
      if (score < queryWords.size * 8) score = 0;
      if (
        name === query.toLowerCase() ||
        (normalized && words(component.name).join(' ') === normalized)
      )
        score += 100;
      if (normalized && words(component.name).join(' ').includes(normalized))
        score += 30;
      if (
        normalized &&
        words(component.keywords).join(' ').includes(normalized)
      )
        score += 22;
      if (
        normalized.length >= 4 &&
        distance(name, normalized.replaceAll(' ', '')) <= 2
      )
        score += 12;
      return { ...component, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        Number(right.name === right.family) -
          Number(left.name === left.family) ||
        left.name.localeCompare(right.name)
    )
    .slice(0, limit);
}

function summary(component: Component) {
  return `${styleText('bold', component.name)}\n  ${component.keywords}\n  ${component.importStatement}`;
}

function componentList(components: Component[]) {
  const nameWidth = Math.max(9, ...components.map(({ name }) => name.length));
  const width = Math.max(20, (process.stdout.columns || 100) - nameWidth - 4);
  const rows = components.map(({ name, keywords }) => {
    const lines = [''];
    for (const word of (keywords || '—').split(' ')) {
      const last = lines.length - 1;
      if (lines[last] && lines[last].length + word.length + 1 > width) {
        lines.push(word);
      } else {
        lines[last] += `${lines[last] ? ' ' : ''}${word}`;
      }
    }
    return lines
      .map(
        (line, index) =>
          `${(index === 0 ? name : '').padEnd(nameWidth)}  ${line}`
      )
      .join('\n');
  });
  return [
    styleText('bold', `Design system · ${components.length} components`),
    'Run pnpm design-system inspect <name> for imports and examples.',
    '',
    styleText('bold', `${'COMPONENT'.padEnd(nameWidth)}  CAPABILITIES`),
    ...rows,
  ].join('\n');
}

function page(text: string) {
  const result = spawnSync(
    'less',
    ['-FRX', '+g', '-P', '↑/↓ scroll · Space next page · / search · q quit'],
    { input: `${text}\n`, stdio: ['pipe', 'inherit', 'inherit'] }
  );
  // Plain output also works on systems without less.
  if (result.error || (result.status !== 0 && !result.signal)) {
    process.stdout.write(`${text}\n`);
  }
}

function run(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      limit: { type: 'string' },
      'no-pager': { type: 'boolean' },
    },
  });
  const [requestedCommand, ...args] = positionals;
  const command =
    requestedCommand === 'component' ? 'inspect' : requestedCommand;
  function print(data: unknown, text: string, browse = false) {
    if (
      browse &&
      !values.json &&
      !values['no-pager'] &&
      process.stdin.isTTY &&
      process.stdout.isTTY &&
      process.env.TERM !== 'dumb' &&
      !process.env.CI
    ) {
      page(text);
    } else {
      process.stdout.write(`${values.json ? JSON.stringify(data) : text}\n`);
    }
  }
  if (values.help || command === undefined) {
    print({ usage: HELP }, HELP);
    return;
  }
  if (!['list', 'search', 'inspect'].includes(command)) {
    throw new CliError('ERR_UNKNOWN_COMMAND', `Unknown command "${command}".`, [
      'list',
      'search',
      'inspect',
    ]);
  }
  if (
    (command === 'list' && args.length > 0) ||
    (command === 'inspect' && args.length > 1)
  ) {
    throw new CliError(
      'ERR_INVALID_ARGUMENT',
      `Unexpected arguments for ${command}.`
    );
  }
  const query = args.join(' ').trim();
  if (command !== 'list' && !query) {
    throw new CliError(
      'ERR_MISSING_ARGUMENT',
      `${command} requires ${command === 'search' ? 'a query' : 'a name'}.`
    );
  }
  const limit = Number(values.limit ?? 10);
  if (
    values.limit !== undefined &&
    (command !== 'search' ||
      !/^\d+$/.test(values.limit) ||
      limit < 1 ||
      limit > 100)
  ) {
    throw new CliError(
      'ERR_INVALID_ARGUMENT',
      '--limit requires search and an integer from 1 to 100.'
    );
  }
  const components = catalog();
  if (command === 'list') {
    print(components, componentList(components), true);
  } else if (command === 'search') {
    const results = search(components, query, limit);
    print(
      results,
      results.map(summary).join('\n\n') || `No components matched "${query}".`,
      true
    );
  } else {
    const component = components.find(
      ({ name }) => name.toLowerCase() === query.toLowerCase()
    );
    if (!component) {
      throw new CliError(
        'ERR_UNKNOWN_COMPONENT',
        `No design-system component named "${query}".`,
        search(components, query, 3).map(({ name }) => name)
      );
    }
    print(
      component,
      `${summary(component)}\n\nFamily: ${component.family}\nSource: ${component.sourceFiles.join(', ')}\nStories: ${component.stories.join(', ') || 'none'}`
    );
  }
}

try {
  run(process.argv.slice(2));
} catch (error) {
  const payload = {
    error:
      error instanceof Error ? error.message : 'The design-system CLI failed.',
    code:
      error instanceof CliError ||
      error instanceof ComponentSourceError ||
      error instanceof StorySourceError
        ? error.code
        : 'ERR_CLI',
    suggestions: error instanceof CliError ? error.suggestions : [],
  };
  process.stderr.write(
    `${process.argv.includes('--json') ? JSON.stringify(payload) : `${payload.code}: ${payload.error}\n${payload.suggestions.length ? `Try: ${payload.suggestions.join(', ')}` : 'Run with --help for usage.'}`}\n`
  );
  process.exitCode = 1;
}
