import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { expect, test } from 'vitest';

import { buildFoundations } from '../cli-foundations.mts';
import { buildGuidance } from '../cli-guidance.mts';

const cli = path.resolve(__dirname, '../cli.mts');
const root = path.resolve(path.dirname(cli), '..');

function invoke(...args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: os.tmpdir(),
    encoding: 'utf8',
    timeout: 10_000,
  });
}

test('handles missing sources and discovers components without keyword entries', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'design-cli-'));
  try {
    const copy = path.join(directory, 'src/cli.mts');
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.writeFileSync(
      copy,
      fs
        .readFileSync(cli, 'utf8')
        .replace(
          '../../cli/src/commands.mts',
          path.join(root, '../cli/src/commands.mts')
        )
    );
    fs.copyFileSync(
      path.join(path.dirname(cli), 'cli-catalog.mts'),
      path.join(path.dirname(copy), 'cli-catalog.mts')
    );
    fs.copyFileSync(
      path.join(path.dirname(cli), 'cli-component-exports.mts'),
      path.join(path.dirname(copy), 'cli-component-exports.mts')
    );
    fs.copyFileSync(
      path.join(path.dirname(cli), 'cli-story-tags.mts'),
      path.join(path.dirname(copy), 'cli-story-tags.mts')
    );
    for (const file of ['cli-guidance.mts', 'cli-foundations.mts']) {
      fs.copyFileSync(
        path.join(path.dirname(cli), file),
        path.join(path.dirname(copy), file)
      );
    }
    fs.symlinkSync(
      path.join(root, '../../node_modules'),
      path.join(directory, 'node_modules'),
      'dir'
    );
    const help = spawnSync(process.execPath, [copy, '--help'], {
      encoding: 'utf8',
    });
    expect(help.status).toBe(0);
    expect(help.stdout).toContain('search <query>');
    const failure = spawnSync(process.execPath, [copy, 'list', '--json'], {
      encoding: 'utf8',
    });
    expect(failure.status).toBe(1);
    expect(failure.stdout).toBe('');
    expect(JSON.parse(failure.stderr)).toMatchObject({ code: 'ERR_CLI' });

    const components = path.join(path.dirname(copy), 'components');
    fs.mkdirSync(components);
    fs.writeFileSync(
      path.join(components, 'NewControl.tsx'),
      `import React, { memo as cache, forwardRef as withRef, createContext } from 'react';
      import type { FC as ComponentFunction, ReactNode } from 'react';
      import * as Controls from './internals/control';
      throw new Error('Component source must never be executed by discovery.');
      export const NewControl = () => null;
      const InternalButton = () => (<button />);
      export { InternalButton as NestedButton };
      export { InternalButton as 'Invalid-Name' };
      export const MemoControl = cache(InternalButton);
      export const RefControl = React.memo(withRef((props, ref) => <button ref={ref} />));
      export class ClassControl extends React.Component {
        render() { return <button />; }
      }
      export const NamespaceControl = Controls.SourceControl;
      export { SourceControl as ReexportControl, Registry as ReexportRegistry } from './internals/exports';
      export { default as DefaultControl } from './internals/default';
      export { CyclicControl } from './internals/cycle';
      export { SourceControl as AliasControl } from '@/components/internals/control';
      export { SourceControl as ExtensionControl } from './internals/control.js';
      export * from './internals/star';
      export * as ControlNamespace from './internals/control';
      export const URLControl = () => <input />;
      export const TypedControl: ComponentFunction<{ children: ReactNode }> = props => props.children;
      export function RenderedControl(props): ReactNode { return props.children; }
      export type NestedProps = {};
      export const CONTROL_SIZE = 10;
      export const useControl = () => {};
      export const ControlContext = createContext(null);
      export const ControlSettings = { size: 10 };
      export const ControlSize = 10;
      export const ParseSettings = () => ({ size: 10 });
      export const MaybeSettings = (empty) => empty ? null : { size: 10 };
      export function NullableRegistry(empty) {
        if (empty) return null;
        return { size: 10 };
      }
      export function SlotFactory() {
        const Slot = () => <div />;
        return { Slot };
      }
      export const ControlSlot = SlotFactory();
      export class ControlRegistry {}`
    );
    fs.mkdirSync(path.join(components, 'internals'));
    fs.writeFileSync(
      path.join(components, 'internals/control.tsx'),
      `export const SourceControl = () => <button />;
      export const Registry = { Slot: SourceControl };`
    );
    fs.writeFileSync(
      path.join(components, 'internals/exports.ts'),
      `export { SourceControl, Registry } from './control';`
    );
    fs.writeFileSync(
      path.join(components, 'internals/default.tsx'),
      `export default () => <button />;`
    );
    fs.writeFileSync(
      path.join(components, 'internals/cycle.ts'),
      `export { CyclicControl } from '../NewControl';`
    );
    fs.writeFileSync(
      path.join(components, 'internals/star.tsx'),
      `export const StarControl = () => <input />;
      export const StarRegistry = { size: 10 };
      export type StarProps = {};
      export default () => <input />;
      export * from '../NewControl';`
    );
    fs.writeFileSync(
      path.join(components, 'RegistryOnly.ts'),
      `export const RegistryOnly = { size: 10 };`
    );
    fs.writeFileSync(
      path.join(components, 'DefaultOnly.tsx'),
      `export function DefaultOnly() { return <div />; }
      export default DefaultOnly;`
    );
    fs.writeFileSync(path.join(components, 'README.md'), '# Components');
    const discovered = spawnSync(
      process.execPath,
      [copy, 'search', 'new control', '--limit', '1', '--json'],
      { encoding: 'utf8' }
    );
    expect(discovered.status, discovered.stderr).toBe(0);
    expect(JSON.parse(discovered.stdout)).toEqual([
      expect.objectContaining({
        name: 'NewControl',
        importPath: '@langchain/macaw-components/NewControl',
        stories: [],
      }),
    ]);
    const listed = spawnSync(process.execPath, [copy, 'list', '--json'], {
      encoding: 'utf8',
    });
    expect(listed.status, listed.stderr).toBe(0);
    expect(
      JSON.parse(listed.stdout).map(({ name }: { name: string }) => name)
    ).toEqual([
      'AliasControl',
      'ClassControl',
      'DefaultControl',
      'DefaultOnly',
      'ExtensionControl',
      'MemoControl',
      'NamespaceControl',
      'NestedButton',
      'NewControl',
      'ReexportControl',
      'RefControl',
      'RenderedControl',
      'StarControl',
      'TypedControl',
      'URLControl',
    ]);
    expect(JSON.parse(listed.stdout)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'DefaultOnly',
          importStatement:
            "import { DefaultOnly } from '@langchain/macaw-components/DefaultOnly';",
        }),
      ])
    );

    const stories = path.join(path.dirname(copy), 'stories');
    fs.mkdirSync(stories);
    const familyStory = path.join(stories, 'NewControl.stories.tsx');
    fs.writeFileSync(
      familyStory,
      `import { NewControl } from './not-a-runtime-dependency';
      throw new Error('Story source must never execute during discovery.');
      const documentation = {
        component: NewControl,
        tags: ['autodocs', 'a11y-test', 'dev', 'test', 'manifest', 'play-fn', 'test-fn', 'obsolete', '!obsolete', 'calendar', 'date picker', 'calendar'],
        parameters: { tags: ['unrelated'] },
      } satisfies Meta<typeof NewControl>;
      export default documentation;
      export const Example = { tags: ['story-only'] };`
    );
    const tagged = spawnSync(
      process.execPath,
      [copy, 'search', 'date picker', '--json'],
      { encoding: 'utf8' }
    );
    expect(tagged.status, tagged.stderr).toBe(0);
    expect(JSON.parse(tagged.stdout)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'NewControl',
          keywords: 'calendar, date picker',
          stories: ['src/stories/NewControl.stories.tsx'],
        }),
      ])
    );
    fs.writeFileSync(
      path.join(stories, 'NestedButton.stories.tsx'),
      `export default { tags: ['autodocs', 'scheduling'] } satisfies Meta;`
    );
    const specific = spawnSync(
      process.execPath,
      [copy, 'inspect', 'NestedButton', '--json'],
      { encoding: 'utf8' }
    );
    expect(specific.status, specific.stderr).toBe(0);
    expect(JSON.parse(specific.stdout)).toMatchObject({
      keywords: 'scheduling',
      stories: ['src/stories/NestedButton.stories.tsx'],
    });
    fs.writeFileSync(familyStory, `export default { tags: createTags() };`);
    const dynamicTags = spawnSync(process.execPath, [copy, 'list', '--json'], {
      encoding: 'utf8',
    });
    expect(dynamicTags.status).toBe(1);
    expect(dynamicTags.stdout).toBe('');
    expect(JSON.parse(dynamicTags.stderr)).toMatchObject({
      code: 'ERR_STORY_SOURCE',
      error: expect.stringContaining('static tags array'),
    });
    fs.writeFileSync(familyStory, `export default { tags: ['calendar' };`);
    const invalidStory = spawnSync(process.execPath, [copy, 'list', '--json'], {
      encoding: 'utf8',
    });
    expect(invalidStory.status).toBe(1);
    expect(JSON.parse(invalidStory.stderr)).toMatchObject({
      code: 'ERR_STORY_SOURCE',
    });
    fs.writeFileSync(familyStory, `export default {};`);

    fs.writeFileSync(
      path.join(components, 'internals/exports.ts'),
      "export { SourceControl } from './missing';"
    );
    const missing = spawnSync(process.execPath, [copy, 'list', '--json'], {
      encoding: 'utf8',
    });
    expect(missing.status).toBe(1);
    expect(missing.stdout).toBe('');
    expect(JSON.parse(missing.stderr)).toMatchObject({
      code: 'ERR_COMPONENT_SOURCE',
    });
    fs.writeFileSync(
      path.join(components, 'internals/exports.ts'),
      'export const Broken = <'
    );
    const invalid = spawnSync(process.execPath, [copy, 'list', '--json'], {
      encoding: 'utf8',
    });
    expect(invalid.status).toBe(1);
    expect(invalid.stdout).toBe('');
    expect(JSON.parse(invalid.stderr)).toMatchObject({
      code: 'ERR_COMPONENT_SOURCE',
    });
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test.each([
  ['CommandMenu', 'Command', 'Command/CommandMenu.tsx'],
  ['RadioGroupItem', 'RadioGroup', 'RadioGroup/RadioGroupItem.tsx'],
  ['KbdGroup', 'Kbd', 'Kbd/Kbd.tsx'],
  ['CopyIconButton', 'CopyButton', 'CopyButton/CopyButton.tsx'],
  ['ChartTooltipBody', 'ChartTooltip', 'ChartTooltip/ChartTooltip.tsx'],
  ['ChartTooltipHeader', 'ChartTooltip', 'ChartTooltip/ChartTooltip.tsx'],
  ['ChartTooltipRow', 'ChartTooltip', 'ChartTooltip/ChartTooltip.tsx'],
  ['TabList', 'Tabs', 'Tabs/index.tsx'],
  ['TabGroup', 'Tabs', 'Tabs/index.tsx'],
  ['TabPanels', 'Tabs', 'Tabs/index.tsx'],
  ['ToastProvider', 'Toast', 'Toast/index.tsx'],
  ['DialogTitle', 'Dialog', 'Dialog/index.tsx'],
  ['HoverCardTrigger', 'HoverCard', 'HoverCard.tsx'],
])(
  'looks up the public %s export with its family metadata',
  (name, family, source) => {
    const result = invoke('inspect', name, '--json');
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      name,
      family,
      importPath: `@langchain/macaw-components/${family}`,
      importStatement: `import { ${name} } from '@langchain/macaw-components/${family}';`,
      sourceFiles: expect.arrayContaining([`src/components/${source}`]),
      stories: [
        family === 'HoverCard'
          ? 'src/components/HoverCard.stories.tsx'
          : `src/components/${family}/${family}.stories.tsx`,
      ],
    });
  }
);

test('discovers current components and returns usable imports and source paths', () => {
  const result = invoke('list', '--json');
  expect(result.status, result.stderr).toBe(0);
  expect(result.stderr).toBe('');
  const components = JSON.parse(result.stdout);
  expect(components.map(({ name }: { name: string }) => name)).toEqual(
    expect.arrayContaining([
      'Typeahead',
      'LineChart',
      'CodeLite',
      'GroupedTabs',
      'RadioCard',
      'UnsavedChangesDialog',
    ])
  );
  for (const component of components) {
    const modulePath = path.join(
      root,
      component.importPath.replace(
        '@langchain/macaw-components/',
        'src/components/'
      )
    );
    expect(
      ['.ts', '.tsx', '/index.ts', '/index.tsx'].some((suffix) =>
        fs.existsSync(`${modulePath}${suffix}`)
      ),
      component.importPath
    ).toBe(true);
    expect(component.sourceFiles.length).toBeGreaterThan(0);
    for (const file of [...component.sourceFiles, ...component.stories]) {
      expect(fs.existsSync(path.join(root, file)), file).toBe(true);
      expect(file).not.toMatch(/__tests__|\.test\./);
    }
  }
});

test('provides the correct default import for UnsavedChangesDialog', () => {
  const result = invoke('inspect', 'UnsavedChangesDialog', '--json');
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    importStatement:
      "import UnsavedChangesDialog from '@langchain/macaw-components/UnsavedChangesDialog';",
  });
});

test('keeps component as a compatible alias for inspect', () => {
  const result = invoke('component', 'Typeahead', '--json');
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    name: 'Typeahead',
    importPath: '@langchain/macaw-components/Typeahead',
  });
  const help = invoke('--help');
  expect(help.stdout).toContain('inspect <name>');
});

test.each([{ options: [] }, { options: ['--no-pager'] }])(
  'prints a readable complete list when piped: $options',
  ({ options }) => {
    const result = invoke('list', ...options);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('COMPONENT');
    expect(result.stdout).toContain('CAPABILITIES');
    expect(result.stdout).toContain('Avatar');
    expect(result.stdout).toContain('UnsavedChangesDialog');
    expect(result.stdout).not.toContain('import {');
    expect(result.stdout).not.toContain('\u001b');
  }
);

test.each([
  'DialogContainerContext',
  'TopBarPaneSlot',
  'CustomHeaderSlot',
  'HeaderTitleActionSlot',
  'PortalSlot',
  'Tabs',
  'Toast',
])('rejects non-component or unexported names: %s', (name) => {
  const result = invoke('inspect', name, '--json');
  expect(result.status).toBe(1);
  expect(result.stdout).toBe('');
  expect(JSON.parse(result.stderr)).toMatchObject({
    code: 'ERR_UNKNOWN_COMPONENT',
  });
});

test.each([
  ['searchable multi select', 'Typeahead'],
  ['drawer side panel', 'Pane'],
  ['copy text to clipboard', 'CopyButton'],
  ['line chart', 'LineChart'],
  ['stacked area chart', 'LineChart'],
  ['Buttn', 'Button'],
  ['RadioCard', 'RadioCard'],
  ['CommandMenu', 'CommandMenu'],
  ['CopyIconButton', 'CopyIconButton'],
  ['single select cards', 'RadioCard'],
  ['resizable side panel', 'SplitViewPane'],
  ['modal dialog', 'Dialog'],
  ['right click menu', 'ContextMenu'],
  ['text input', 'Input'],
  ['read only code', 'CodeLite'],
  ['toast notification', 'ToastProvider'],
  ['tabs navigation', 'TabGroup'],
  ['cards', 'Card'],
  ['checkboxes', 'Checkbox'],
  ['render error fallback', 'ErrorBoundary'],
  ['virtual scrolling', 'TextVirtualizer'],
  ['automatic links', 'TextWithLinks'],
  ['discard changes', 'UnsavedChangesDialog'],
  ['persistent warning', 'Banner'],
  ['choose an option', 'RadioGroup'],
])('finds %s as %s', (query, expected) => {
  const result = invoke('search', query, '--limit', '1', '--json');
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual([
    expect.objectContaining({ name: expected }),
  ]);
});

test.each(['data grid', 'date picker', 'portal slot', 'the and with'])(
  'does not suggest unrelated components for %s',
  (query) => {
    const result = invoke('search', query, '--json');
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([]);
  }
);

test('handles unquoted queries, empty results, and text output', () => {
  const search = invoke(
    'search',
    'searchable',
    'multi',
    'select',
    '--limit',
    '1'
  );
  expect(search.status, search.stderr).toBe(0);
  expect(search.stdout).toContain('@langchain/macaw-components/Typeahead');
  const empty = invoke('search', 'zzzzzzzzzz', '--json');
  expect(empty.status).toBe(0);
  expect(JSON.parse(empty.stdout)).toEqual([]);
  const text = invoke('inspect', 'Button');
  expect(text.status).toBe(0);
  expect(text.stdout).toContain('Source:');
  expect(text.stdout).toContain(
    'Stories: src/components/Button/Button.stories.tsx'
  );
});

test('looks up components case-insensitively without unrelated stories', () => {
  const result = invoke('inspect', 'button', '--json');
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    name: 'Button',
    importPath: '@langchain/macaw-components/Button',
    stories: ['src/components/Button/Button.stories.tsx'],
  });
  const failure = invoke('inspect', 'Buttn', '--json');
  expect(failure.status).toBe(1);
  expect(failure.stdout).toBe('');
  expect(JSON.parse(failure.stderr)).toMatchObject({
    code: 'ERR_UNKNOWN_COMPONENT',
    suggestions: ['Button'],
  });
});

test.each([
  ['search'],
  ['search', '   '],
  ['inspect'],
  ['inspect', 'Button', 'extra'],
  ['list', 'extra'],
  ['foundations', 'spacing', 'extra'],
  ['foundations', '--limit', '1'],
  ['foundations', 'unknown-topic'],
  ['foundations', '__proto__'],
  ['list', '--limit', '2'],
  ['search', 'button', '--limit', '0'],
  ['search', 'button', '--limit', '101'],
  ['search', 'button', '--limit', '1.5'],
  ['search', 'button', '--limit'],
  ['list', '--unknown'],
  ['list', '-x'],
  ['unknown'],
])('rejects invalid arguments: %s', (...args) => {
  const result = invoke(...args, '--json');
  expect(result.status).toBe(1);
  expect(result.stdout).toBe('');
  expect(JSON.parse(result.stderr)).toMatchObject({
    error: expect.any(String),
    code: expect.stringMatching(/^ERR_/),
  });
});

test('deduplicates capability search by family while preserving exact subpart discovery', () => {
  const result = invoke('search', 'choose an option', '--json');
  expect(result.status, result.stderr).toBe(0);
  const matches = JSON.parse(result.stdout);
  expect(matches.map(({ name }: { name: string }) => name)).toEqual(
    expect.arrayContaining(['RadioGroup', 'Select'])
  );
  expect(
    new Set(matches.map(({ family }: { family: string }) => family)).size
  ).toBe(matches.length);
  const exact = invoke('search', 'RadioGroupItem', '--json');
  expect(JSON.parse(exact.stdout)[0].name).toBe('RadioGroupItem');
  const part = invoke('inspect', 'RadioGroupItem', '--json');
  expect(JSON.parse(part.stdout)).toMatchObject({
    name: 'RadioGroupItem',
    guidance: { scope: 'RadioGroup' },
  });
});

test('exposes curated decisions and verified prop variants without leaking root APIs into subparts', () => {
  const result = invoke('inspect', 'Banner', '--json');
  expect(result.status, result.stderr).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    packageVersion: expect.any(String),
    guidance: {
      scope: 'Banner',
      useWhen: expect.any(Array),
      guidanceLink: 'docs/STYLES.md#banners',
      supportedProps: {
        intent: {
          values: ['warning', 'info', 'success', 'error', 'neutral'],
          default: "'warning'",
        },
      },
    },
  });
  const subpart = invoke('inspect', 'SelectTrigger', '--json');
  expect(subpart.status, subpart.stderr).toBe(0);
  const guidance = JSON.parse(subpart.stdout).guidance;
  expect(guidance.scope).toBe('Select');
  expect(guidance.supportedProps).toBeUndefined();
  expect(guidance.apiSource).toBeUndefined();
});

test('derives selected props from source without executing components or duplicating defaults', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'macaw-guidance-'));
  try {
    fs.mkdirSync(path.join(directory, 'docs'));
    fs.writeFileSync(
      path.join(directory, 'docs/component-guidance.json'),
      JSON.stringify({
        Control: {
          useWhen: ['An action.'],
          api: {
            source: 'control.tsx',
            propsType: 'ControlProps',
            props: ['variant', 'disabled'],
          },
        },
      })
    );
    const source = (value: string) =>
      `throw new Error('Never execute component source'); type Variant = 'plain' | 'outlined'; interface ControlProps { variant?: Variant; disabled?: boolean } export const Control = ({ variant = '${value}', disabled = false }: ControlProps) => null;`;
    fs.writeFileSync(path.join(directory, 'control.tsx'), source('plain'));
    expect(buildGuidance(directory).Control).toMatchObject({
      supportedProps: {
        variant: {
          type: 'Variant',
          values: ['plain', 'outlined'],
          default: "'plain'",
        },
        disabled: { type: 'boolean', default: 'false' },
      },
    });
    fs.writeFileSync(path.join(directory, 'control.tsx'), source('outlined'));
    expect(
      buildGuidance(directory).Control.supportedProps?.variant.default
    ).toBe("'outlined'");
    fs.writeFileSync(
      path.join(directory, 'control.tsx'),
      'export const Control = () => null;'
    );
    expect(() => buildGuidance(directory)).toThrow(
      'Missing documented prop Control.variant'
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('retrieves compact versioned foundations and preserves canonical semantic relationships', () => {
  const foundations = buildFoundations(root);
  expect(foundations.topics.surfaces.roles).toEqual(
    expect.arrayContaining([
      {
        utility: 'bg-input',
        token: '--bg-input',
        purpose:
          'Input and textarea fields, picker controls, filled popup triggers',
      },
      {
        utility: 'bg-popover',
        token: '--bg-popover',
        purpose: 'Floating tooltips, popovers, and menu surfaces',
      },
    ])
  );
  expect(foundations.topics.spacing.relationships).toEqual(
    expect.arrayContaining([
      {
        relationship: 'Modal header ↔ body ↔ footer',
        utilities: ['gap-space-5'],
      },
      {
        relationship: 'List or table row padding',
        utilities: ['px-space-5', 'py-space-4'],
      },
    ])
  );
  const index = invoke('foundations', '--json');
  expect(index.status, index.stderr).toBe(0);
  expect(JSON.parse(index.stdout)).toMatchObject({
    version: foundations.version,
    topics: { spacing: { title: 'Spacing relationships' } },
  });
  expect(index.stdout.length).toBeLessThan(2500);
  const topic = invoke('foundations', 'spacing', '--json');
  expect(topic.status, topic.stderr).toBe(0);
  expect(JSON.parse(topic.stdout)).toMatchObject({
    version: foundations.version,
    topic: 'spacing',
    relationships: foundations.topics.spacing.relationships,
  });
  expect(JSON.parse(topic.stdout).content).not.toContain('## Components');
});

test('installed CLI reads richer and legacy v1 catalogs without React or repository source', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'macaw-installed-'));
  try {
    const installed = path.join(
      directory,
      'node_modules/@langchain/macaw-components'
    );
    fs.mkdirSync(installed, { recursive: true });
    fs.writeFileSync(path.join(directory, 'package.json'), '{}');
    fs.writeFileSync(
      path.join(installed, 'package.json'),
      JSON.stringify({
        name: '@langchain/macaw-components',
        exports: { './catalog.json': './catalog.json' },
      })
    );
    const component = {
      name: 'Banner',
      family: 'Banner',
      keywords: 'warning',
      importPath: '@langchain/macaw-components/Banner',
      importStatement:
        "import { Banner } from '@langchain/macaw-components/Banner';",
      sourceFiles: [],
      stories: [],
    };
    const data = {
      schemaVersion: 1,
      packageName: '@langchain/macaw-components',
      version: '0.1.2',
      components: [
        {
          ...component,
          guidance: {
            searchTerms: ['persistent warning'],
            useWhen: ['A notice.'],
            supportedProps: {
              intent: {
                type: 'BannerIntent',
                values: ['warning'],
                required: false,
                default: "'warning'",
              },
            },
          },
        },
      ],
      foundations: {
        schemaVersion: 1,
        packageName: '@langchain/macaw-components',
        version: '0.1.2',
        topics: {
          usage: {
            title: 'Usage',
            source: 'https://example.test/v0.1.2/docs/STYLES.md',
            content: 'Use semantic tokens.',
          },
        },
      },
    };
    const run = (...args: string[]) =>
      spawnSync(
        process.execPath,
        [path.join(root, '../cli/src/cli.mts'), ...args, '--json'],
        { cwd: directory, encoding: 'utf8' }
      );
    fs.writeFileSync(
      path.join(installed, 'catalog.json'),
      JSON.stringify(data)
    );
    const rich = run('inspect', 'Banner');
    expect(rich.status, rich.stderr).toBe(0);
    expect(JSON.parse(rich.stdout)).toMatchObject({
      packageVersion: '0.1.2',
      guidance: data.components[0].guidance,
    });
    expect(JSON.parse(run('search', 'persistent warning').stdout)).toHaveLength(
      1
    );
    expect(JSON.parse(run('foundations', 'usage').stdout)).toMatchObject({
      version: '0.1.2',
      content: 'Use semantic tokens.',
    });
    fs.writeFileSync(
      path.join(installed, 'catalog.json'),
      JSON.stringify({
        ...data,
        components: [component],
        foundations: undefined,
      })
    );
    expect(run('inspect', 'Banner').status).toBe(0);
    expect(run('search', 'warning').status).toBe(0);
    const unavailable = run('foundations');
    expect(unavailable.status).toBe(1);
    expect(JSON.parse(unavailable.stderr)).toMatchObject({
      code: 'ERR_FOUNDATIONS_UNAVAILABLE',
    });
    fs.writeFileSync(
      path.join(installed, 'catalog.json'),
      JSON.stringify({ ...data, schemaVersion: 999 })
    );
    expect(JSON.parse(run('list').stderr)).toMatchObject({
      code: 'ERR_CATALOG_VERSION',
    });
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
