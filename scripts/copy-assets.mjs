import { copyFileSync } from 'node:fs';

const styleFiles = ['base.css', 'styles.css', 'tokens.css'];

for (const file of styleFiles) {
  copyFileSync(
    new URL(`../src/styles/${file}`, import.meta.url),
    new URL(`../dist/${file}`, import.meta.url)
  );
}

copyFileSync(
  new URL('../src/components/ThinkingState/NOTICE', import.meta.url),
  new URL('../dist/components/ThinkingState/NOTICE', import.meta.url)
);
