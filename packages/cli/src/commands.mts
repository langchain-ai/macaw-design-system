import { spawnSync } from 'node:child_process';
import { parseArgs, styleText } from 'node:util';

export type Component = {
  name: string;
  family: string;
  keywords: string;
  importPath: string;
  importStatement: string;
  sourceFiles: string[];
  stories: string[];
  packageVersion?: string;
  guidance?: {
    scope?: string;
    useWhen?: string[];
    avoidWhen?: string[];
    relatedComponents?: string[];
    composition?: string[];
    providers?: string[];
    accessibility?: string[];
    guidanceLink?: string;
    example?: string;
    searchTerms?: string[];
    apiSource?: string;
    apiCoverage?: string;
    supportedProps?: Record<
      string,
      { type: string; required: boolean; values?: string[]; default?: string }
    >;
  };
};

export type Foundations = {
  schemaVersion: 1;
  packageName: string;
  version: string;
  topics: Record<
    string,
    {
      title: string;
      source: string;
      content: string;
      roles?: { utility: string; token: string; purpose: string }[];
      relationships?: { relationship: string; utilities: string[] }[];
    }
  >;
};

const HELP = `Discover design-system components.

Usage: macaw <command>
  init                       Set up agent guidance in this project
  list                       Browse components (↑/↓ scroll, q quit)
  search <query>             Find components by name or capability
  inspect <name>             Show imports, guidance, supported props, and sources
  foundations [topic]        List compact foundation topics or retrieve one

Options: --json, --no-pager, --limit <1–100> (search; default 10), --help (-h)
For pipeable JSON: macaw <command> --json`;

export class CliError extends Error {
  readonly code: string;
  readonly suggestions: string[];

  constructor(code: string, message: string, suggestions: string[] = []) {
    super(message);
    this.code = code;
    this.suggestions = suggestions;
  }
}

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
  const families = new Set<string>();
  return components
    .map((component) => {
      const name = component.name.toLowerCase();
      const terms = new Set(
        words(
          `${component.name} ${component.family} ${component.keywords} ${component.guidance?.searchTerms?.join(' ') ?? ''}`
        )
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
    .filter(({ family }) => {
      if (families.has(family)) return false;
      families.add(family);
      return true;
    })
    .slice(0, limit);
}

function summary(component: Component) {
  return `${styleText('bold', component.name)}\n  ${component.keywords}\n  ${component.importStatement}`;
}

function guidanceText(component: Component) {
  const guidance = component.guidance;
  if (!guidance)
    return 'Guidance: not yet curated; inspect the linked source and stories.';
  return [
    `Guidance scope: ${guidance.scope ?? component.family}`,
    ...(
      [
        'useWhen',
        'avoidWhen',
        'composition',
        'providers',
        'accessibility',
        'relatedComponents',
      ] as const
    )
      .filter((key) => guidance[key]?.length)
      .map((key) => `${key}: ${guidance[key]!.join(' ')}`),
    guidance.guidanceLink && `Guide: ${guidance.guidanceLink}`,
    guidance.example && `Example: ${guidance.example}`,
    guidance.supportedProps &&
      `Selected props: ${JSON.stringify(guidance.supportedProps)}`,
    guidance.apiCoverage,
    guidance.apiSource && `API source: ${guidance.apiSource}`,
  ]
    .filter(Boolean)
    .join('\n');
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

export function run(
  argv: string[],
  catalog: () => Component[],
  initialize?: () => string,
  foundations?: () => Foundations
) {
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
  if (command === 'init' && initialize) {
    if (args.length > 0 || values.limit !== undefined) {
      throw new CliError(
        'ERR_INVALID_ARGUMENT',
        'init does not accept arguments or --limit.'
      );
    }
    const file = initialize();
    print({ file }, `Created ${file}`);
    return;
  }
  if (command === 'foundations') {
    if (args.length > 1 || values.limit !== undefined)
      throw new CliError(
        'ERR_INVALID_ARGUMENT',
        'foundations accepts one optional topic and no --limit.'
      );
    if (!foundations)
      throw new CliError(
        'ERR_FOUNDATIONS_UNAVAILABLE',
        'This catalog has no foundations. Update @langchain/macaw-components for compact guidance.'
      );
    const data = foundations();
    const topic = args[0]?.toLowerCase();
    if (topic) {
      const entry = Object.hasOwn(data.topics, topic)
        ? data.topics[topic]
        : undefined;
      if (!entry)
        throw new CliError(
          'ERR_UNKNOWN_FOUNDATION',
          `Unknown foundation topic "${topic}".`,
          Object.keys(data.topics)
        );
      print(
        {
          packageName: data.packageName,
          version: data.version,
          topic,
          ...entry,
        },
        `${entry.title} · ${data.version}\n${entry.source}\n\n${entry.content}`
      );
    } else {
      const topics = Object.fromEntries(
        Object.entries(data.topics).map(([key, { title, source }]) => [
          key,
          { title, source },
        ])
      );
      print(
        { packageName: data.packageName, version: data.version, topics },
        `Foundations · ${data.version}\nRun macaw foundations <topic> for focused guidance.\n\n${Object.entries(
          topics
        )
          .map(([key, { title, source }]) => `${key}: ${title}\n  ${source}`)
          .join('\n')}`
      );
    }
    return;
  }
  if (!['list', 'search', 'inspect'].includes(command)) {
    throw new CliError('ERR_UNKNOWN_COMMAND', `Unknown command "${command}".`, [
      'list',
      'search',
      'inspect',
      'foundations',
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
      `${summary(component)}\n\nFamily: ${component.family}\nSource: ${component.sourceFiles.join(', ')}\nStories: ${component.stories.join(', ') || 'none'}\nVersion: ${component.packageVersion ?? 'not recorded'}\n\n${guidanceText(component)}`
    );
  }
}

export function main(
  argv: string[],
  catalog: () => Component[],
  initialize?: () => string,
  foundations?: () => Foundations
) {
  try {
    run(argv, catalog, initialize, foundations);
  } catch (error) {
    const payload = {
      error:
        error instanceof Error
          ? error.message
          : 'The design-system CLI failed.',
      code:
        error instanceof Error &&
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('ERR_')
          ? error.code
          : 'ERR_CLI',
      suggestions: error instanceof CliError ? error.suggestions : [],
    };
    process.stderr.write(
      `${argv.includes('--json') ? JSON.stringify(payload) : `${payload.code}: ${payload.error}\n${payload.suggestions.length ? `Try: ${payload.suggestions.join(', ')}` : 'Run with --help for usage.'}`}\n`
    );
    process.exitCode = 1;
  }
}
