import path from 'node:path';
import { buildCatalogModel } from './model.js';

const architectureRoot = path.resolve(import.meta.dirname, '../../architecture');
buildCatalogModel(architectureRoot)
  .then((model) => console.log(`Validated ${model.domains.length * 4} architecture YAML files.`))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
