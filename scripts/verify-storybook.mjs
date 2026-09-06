import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const { entries } = JSON.parse(
  readFileSync(new URL('storybook-static/index.json', root), 'utf8')
);
const titles = new Set(
  Object.values(entries).map(({ title }) => title.split('/').at(-1))
);
for (const directory of readdirSync(new URL('src/components/', root), {
  withFileTypes: true,
})) {
  if (!directory.isDirectory() || directory.name === '__tests__') continue;
  // PlainTextEditor is an implementation surface demonstrated by Code's editable story.
  const name =
    directory.name === 'PlainTextEditor'
      ? 'Code'
      : directory.name === 'Command'
        ? 'CommandMenu'
        : directory.name;
  assert.ok(
    titles.has(name),
    `Missing Storybook coverage for ${directory.name}`
  );
}
assert.ok(
  Object.values(entries).some(
    ({ title }) => title === 'Foundations/Component Sizes'
  )
);
assert.ok(
  Object.values(entries).some(({ title }) => title === 'Components/Overview')
);
console.log(
  `Verified ${Object.keys(entries).length} Storybook entries and component coverage.`
);
