import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalogModel } from './model.js';
import { renderCatalog } from './render.js';

export interface GenerateOptions { catalogRoot: string; architectureRoot?: string }

export async function generateCatalog(options: GenerateOptions) {
  const architectureRoot = options.architectureRoot ?? path.join(options.catalogRoot, 'architecture');
  const model = await buildCatalogModel(architectureRoot);
  return renderCatalog(options.catalogRoot, model);
}

const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedFile === fileURLToPath(import.meta.url)) {
  const catalogRoot = path.resolve(import.meta.dirname, '../..');
  generateCatalog({ catalogRoot })
    .then((manifest) => console.log(`Generated ${manifest.resources.length} files from architecture/.`))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
