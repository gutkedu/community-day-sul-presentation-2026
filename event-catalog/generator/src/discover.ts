import { access, readdir } from 'node:fs/promises';
import path from 'node:path';

export const requiredFiles = ['catalog.yaml', 'openapi.yaml', 'asyncapi.yaml', 'template.yaml'] as const;
export type RequiredFile = (typeof requiredFiles)[number];

export interface DomainSource {
  directory: string;
  files: Record<RequiredFile, string>;
}

export async function discoverSources(architectureRoot: string): Promise<DomainSource[]> {
  const domainsRoot = path.join(architectureRoot, 'domains');
  let entries;
  try {
    entries = await readdir(domainsRoot, { withFileTypes: true });
  } catch (error) {
    throw new Error(`${domainsRoot}: unable to discover domains`, { cause: error });
  }

  const sources: DomainSource[] = [];
  for (const entry of entries.filter((candidate) => candidate.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const directory = path.join(domainsRoot, entry.name);
    const files = Object.fromEntries(requiredFiles.map((name) => [name, path.join(directory, name)])) as Record<RequiredFile, string>;
    for (const [name, file] of Object.entries(files)) {
      try {
        await access(file);
      } catch {
        throw new Error(`${directory}: missing required file ${name}`);
      }
    }
    sources.push({ directory, files });
  }

  if (sources.length === 0) throw new Error(`${domainsRoot}: no domain sources found`);
  return sources;
}
