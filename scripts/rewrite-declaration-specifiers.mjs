import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const distRoot = resolve(repositoryRoot, 'dist');
const failures = [];
let rewrittenSpecifierCount = 0;

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function rewriteSpecifier(declarationPath, specifier) {
  const target = resolve(dirname(declarationPath), specifier);

  if (existsSync(target) && statSync(target).isFile()) {
    return specifier;
  }

  if (existsSync(`${target}.js`)) {
    rewrittenSpecifierCount += 1;
    return `${specifier}.js`;
  }

  if (existsSync(resolve(target, 'index.js'))) {
    rewrittenSpecifierCount += 1;
    return `${specifier.replace(/\/$/, '')}/index.js`;
  }

  failures.push(
    `cannot resolve relative declaration specifier ${specifier} in ${declarationPath}`
  );
  return specifier;
}

function rewriteModuleSpecifiers(declarationPath, source) {
  const rewrite = (match, prefix, quote, specifier) =>
    `${prefix}${quote}${rewriteSpecifier(declarationPath, specifier)}${quote}`;

  return source
    .replace(/(\bfrom\s*)(['"])(\.\.?\/[^'"]+)\2/g, rewrite)
    .replace(/(\bimport\s*\(\s*)(['"])(\.\.?\/[^'"]+)\2/g, rewrite)
    .replace(/(\bimport\s*)(['"])(\.\.?\/[^'"]+)\2/g, rewrite);
}

for (const declarationPath of walk(distRoot).filter((path) =>
  path.endsWith('.d.ts')
)) {
  const source = readFileSync(declarationPath, 'utf8');
  const rewritten = rewriteModuleSpecifiers(declarationPath, source);
  if (rewritten !== source) {
    writeFileSync(declarationPath, rewritten);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Rewrote ${rewrittenSpecifierCount} declaration specifiers for NodeNext.`
  );
}
