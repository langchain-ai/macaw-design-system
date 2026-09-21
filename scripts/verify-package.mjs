import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const packageJson = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8')
);
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(exportTargets);
  }
  return [];
}

const declaredPackages = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
  ...packageJson.peerDependencies,
};

if ('@langchain/untitled-ui-icons' in declaredPackages) {
  fail('package.json must not declare @langchain/untitled-ui-icons');
}

for (const target of exportTargets(packageJson.exports)) {
  if (target.includes('*')) continue;
  const path = resolve(repositoryRoot, target);
  if (!existsSync(path)) fail(`missing export target: ${target}`);
}

const sourceFiles = walk(resolve(repositoryRoot, 'src'));
const runtimeSourceFiles = sourceFiles.filter(
  (path) =>
    /\.(ts|tsx)$/.test(path) &&
    !path.endsWith('.d.ts') &&
    !path.includes('/__tests__/') &&
    !path.includes('/stories/') &&
    !path.endsWith('.stories.ts') &&
    !path.endsWith('.stories.tsx') &&
    !path.endsWith('.test.ts') &&
    !path.endsWith('.test.tsx') &&
    !path.endsWith('/test-utils.tsx')
);

for (const path of runtimeSourceFiles) {
  const sourceEntry = relative(resolve(repositoryRoot, 'src'), path).replace(
    /\.(ts|tsx)$/,
    ''
  );
  for (const extension of ['.js', '.d.ts']) {
    const output = resolve(
      repositoryRoot,
      'dist',
      `${sourceEntry}${extension}`
    );
    if (!existsSync(output)) {
      fail(
        `missing output for src/${sourceEntry}: dist/${sourceEntry}${extension}`
      );
    }
  }

  const content = readFileSync(path, 'utf8');
  if (/from\s+['"]@\//.test(content) || /import\(\s*['"]@\//.test(content)) {
    fail(`application alias remains in runtime source: ${path}`);
  }
  if (content.includes('@langchain/untitled-ui-icons')) {
    fail(`Untitled UI import remains in runtime source: ${path}`);
  }
}

const componentDirectories = readdirSync(
  resolve(repositoryRoot, 'src/components'),
  {
    withFileTypes: true,
  }
).filter((entry) => entry.isDirectory() && entry.name !== '__tests__');

for (const { name } of componentDirectories) {
  const exportName = `./components/${name}`;
  if (!(exportName in packageJson.exports)) {
    fail(`missing package export for component directory: ${exportName}`);
  }
}

for (const forbiddenDirectory of ['outline', 'solid', 'legacy', 'product']) {
  if (existsSync(resolve(repositoryRoot, 'src/icons', forbiddenDirectory))) {
    const files = walk(
      resolve(repositoryRoot, 'src/icons', forbiddenDirectory)
    );
    if (files.length > 0)
      fail(`forbidden icon tree is present: src/icons/${forbiddenDirectory}`);
  }
}

const distFiles = walk(resolve(repositoryRoot, 'dist')).filter((path) =>
  /\.(js|d\.ts|css)$/.test(path)
);

for (const path of distFiles) {
  const content = readFileSync(path, 'utf8');
  if (content.includes('@langchain/untitled-ui-icons')) {
    fail(`Untitled UI reference remains in output: ${path}`);
  }
  if (/from\s+['"]@\//.test(content) || /import\(\s*['"]@\//.test(content)) {
    fail(`application alias remains in output: ${path}`);
  }
  if (/['"][^'"]+\.svg\?react['"]/.test(content))
    fail(`uncompiled SVG query remains in output: ${path}`);
  if (content.includes('smith-frontend'))
    fail(`application path remains in output: ${path}`);
}

const styles = readFileSync(resolve(repositoryRoot, 'dist/styles.css'), 'utf8');
const tokens = readFileSync(resolve(repositoryRoot, 'dist/tokens.css'), 'utf8');
const utilities = readFileSync(
  resolve(repositoryRoot, 'dist/utilities.css'),
  'utf8'
);

if (
  !styles.includes("@import './components.css'") ||
  !existsSync(resolve(repositoryRoot, 'dist/components.css'))
)
  fail('styles.css must load compiled component styles');
if (
  !existsSync(resolve(repositoryRoot, 'dist/components/ThinkingState/NOTICE'))
)
  fail('ThinkingState attribution is missing from the package');

if (!styles.includes("@import './tokens.css'"))
  fail('styles.css does not load tokens.css');
if (!tokens.includes('--bg-surface-level-1'))
  fail('tokens.css is missing semantic surface tokens');
if (!tokens.includes('html.dark'))
  fail('tokens.css is missing dark-mode overrides');
if (!utilities.includes('.bg-surface-level-1'))
  fail('utilities.css is missing component utility classes');

const packageName = packageJson.name;
await Promise.all([
  import(packageName),
  import(`${packageName}/components/BarChart`),
  import(`${packageName}/components/Code`),
  import(`${packageName}/components/Logo`),
  import(`${packageName}/components/ThinkingState`),
  import(`${packageName}/components/SplitViewPane`),
]);

const require = createRequire(import.meta.url);
const preset = require(`${packageName}/tailwind-preset`);
if (preset.darkMode !== 'class' || preset.content.length !== 0) {
  fail(
    'Tailwind preset must be consumer-scanned and class-based for dark mode'
  );
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${distFiles.length} package output files.`);
}
