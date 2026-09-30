import {
  chmodSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const directory = resolve(root, 'packages/cli');
const dist = resolve(directory, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const { transpileModule, ModuleKind, ScriptTarget } =
  await import('typescript');
for (const file of readdirSync(resolve(directory, 'src')).filter((file) =>
  file.endsWith('.mts')
)) {
  const source = readFileSync(resolve(directory, 'src', file), 'utf8');
  const output = transpileModule(source, {
    compilerOptions: {
      module: ModuleKind.NodeNext,
      target: ScriptTarget.ES2022,
      rewriteRelativeImportExtensions: true,
    },
    fileName: file,
  });
  writeFileSync(
    resolve(dist, file.replace(/\.mts$/, '.mjs')),
    output.outputText
  );
}
chmodSync(resolve(dist, 'cli.mjs'), 0o755);
