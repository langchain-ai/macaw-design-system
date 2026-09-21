#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';

import { CliError, main, type Component } from './commands.mts';

const projectRoot = process.cwd();
const requireFromProject = createRequire(resolve(projectRoot, 'package.json'));

function installedFile(specifier: string) {
  try {
    return requireFromProject.resolve(specifier);
  } catch {
    throw new CliError(
      'ERR_PACKAGE_NOT_FOUND',
      `Cannot resolve ${specifier} from ${projectRoot}. Install @langchain/macaw-components in this project first.`
    );
  }
}

function catalog(): Component[] {
  const file = installedFile('@langchain/macaw-components/catalog.json');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (
    data.schemaVersion !== 1 ||
    data.packageName !== '@langchain/macaw-components' ||
    !Array.isArray(data.components)
  ) {
    throw new CliError(
      'ERR_CATALOG_VERSION',
      'This component catalog is unsupported. Update @langchain/macaw-cli to a compatible version.'
    );
  }
  return data.components;
}

function initialize() {
  installedFile('@langchain/macaw-components/package.json');
  // Keep links on the stable node_modules alias, not a versioned pnpm store path.
  const moduleDirectory = requireFromProject.resolve
    .paths('@langchain/macaw-components')
    ?.find((directory) =>
      existsSync(resolve(directory, '@langchain/macaw-components/package.json'))
    );
  if (!moduleDirectory)
    throw new CliError(
      'ERR_PACKAGE_NOT_FOUND',
      'Cannot locate the installed component documentation.'
    );
  const components = resolve(moduleDirectory, '@langchain/macaw-components');
  const file = resolve(projectRoot, '.agents/skills/macaw/SKILL.md');
  const location = dirname(file);
  const portablePath = (path: string) =>
    relative(location, path).split('\\').join('/');
  const template = readFileSync(
    new URL('../templates/SKILL.md', import.meta.url),
    'utf8'
  ).replaceAll('{{componentsDocs}}', portablePath(resolve(components, 'docs')));
  mkdirSync(location, { recursive: true });
  try {
    writeFileSync(file, template, { flag: 'wx' });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
      throw new CliError(
        'ERR_ALREADY_CONFIGURED',
        `${file} already exists. It has been left unchanged.`
      );
    }
    throw error;
  }
  return relative(projectRoot, file);
}

main(process.argv.slice(2), catalog, initialize);
