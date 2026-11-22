import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({
  options: {
    cli: {
      type: 'string',
      default: resolve(root, 'packages/components/src/cli.mts'),
    },
    cwd: { type: 'string', default: root },
    cases: {
      type: 'string',
      default: resolve(root, 'scripts/retrieval-cases.json'),
    },
  },
});
const cases = JSON.parse(readFileSync(values.cases, 'utf8'));
if (!Array.isArray(cases) || cases.length === 0)
  throw new Error('Provide at least one retrieval case.');
const results = cases.map(({ task, query, families }) => {
  if (
    typeof task !== 'string' ||
    typeof query !== 'string' ||
    !Array.isArray(families) ||
    families.length === 0
  )
    throw new Error('Each case needs task, query, and accepted families.');
  const result = spawnSync(
    process.execPath,
    [resolve(values.cli), 'search', query, '--json', '--limit', '10'],
    {
      cwd: resolve(values.cwd),
      encoding: 'utf8',
      timeout: 10_000,
      maxBuffer: 2_000_000,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    }
  );
  if (result.error || result.status !== 0)
    throw new Error(
      `Retrieval failed for ${task}: ${result.error?.message ?? result.stderr}`
    );
  const components = JSON.parse(result.stdout);
  if (
    !Array.isArray(components) ||
    components.some((entry) => typeof entry.family !== 'string')
  )
    throw new Error(`Invalid search response for ${task}`);
  const rankedFamilies = [...new Set(components.map(({ family }) => family))];
  const position = rankedFamilies.findIndex((family) =>
    families.includes(family)
  );
  return {
    task,
    query,
    acceptedFamilies: families,
    rankedFamilies,
    rank: position < 0 ? null : position + 1,
    packageVersions: [
      ...new Set(
        components.map(({ packageVersion }) => packageVersion).filter(Boolean)
      ),
    ],
  };
});
console.log(
  JSON.stringify(
    {
      kind: 'retrieval-only',
      cli: resolve(values.cli),
      cwd: resolve(values.cwd),
      cases: resolve(values.cases),
      caseCount: results.length,
      hitAt3:
        results.filter(({ rank }) => rank !== null && rank <= 3).length /
        results.length,
      meanReciprocalRankAt10:
        results.reduce(
          (total, { rank }) => total + (rank === null ? 0 : 1 / rank),
          0
        ) / results.length,
      results,
    },
    null,
    2
  )
);
