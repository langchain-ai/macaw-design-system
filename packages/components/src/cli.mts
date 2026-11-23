import { fileURLToPath } from 'node:url';

import { main } from '../../cli/src/commands.mts';
import { buildCatalog } from './cli-catalog.mts';
import { buildFoundations } from './cli-foundations.mts';

const root = fileURLToPath(new URL('../', import.meta.url));
main(
  process.argv.slice(2),
  () => buildCatalog(root),
  () => buildFoundations(root)
);
