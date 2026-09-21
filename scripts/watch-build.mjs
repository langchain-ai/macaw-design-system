import { spawn } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const sourceRoot = fileURLToPath(new URL('../packages', import.meta.url));

let build;
let rebuildRequested = false;
let snapshot = sourceSnapshot(sourceRoot);

function sourceSnapshot(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = resolve(directory, entry.name);
      if (['dist', 'node_modules'].includes(entry.name)) return [];
      if (entry.isDirectory()) {
        return sourceSnapshot(path);
      }

      const stats = statSync(path);
      return `${path}:${stats.size}:${stats.mtimeMs}`;
    })
    .join('\n');
}

function runBuild() {
  build = spawn(packageManager, ['build'], { stdio: 'inherit' });

  build.on('error', (error) => {
    console.error(`Unable to start the package build: ${error.message}`);
    build = undefined;
  });

  build.on('exit', (code) => {
    build = undefined;

    if (code !== 0) {
      console.error('Build failed. Watching for the next source change.');
    }

    if (rebuildRequested) {
      rebuildRequested = false;
      runBuild();
    }
  });
}

const poller = setInterval(() => {
  const nextSnapshot = sourceSnapshot(sourceRoot);
  if (nextSnapshot === snapshot) {
    return;
  }

  snapshot = nextSnapshot;
  if (build) {
    rebuildRequested = true;
  } else {
    runBuild();
  }
}, 500);

function stop(signal) {
  clearInterval(poller);
  if (build) {
    build.kill(signal);
  }
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));

console.log('Building package and watching src/ for changes...');
runBuild();
