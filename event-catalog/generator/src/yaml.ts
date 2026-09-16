import { readFile } from 'node:fs/promises';
import { parseDocument } from 'yaml';

export type YamlObject = Record<string, any>;

export async function readYaml(file: string): Promise<YamlObject> {
  const source = await readFile(file, 'utf8');
  const document = parseDocument(source, { prettyErrors: false });
  if (document.errors.length > 0) {
    throw new Error(`${file}: invalid YAML: ${document.errors.map((error) => error.message).join('; ')}`);
  }
  const value = document.toJS();
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${file}: expected a YAML object`);
  return value as YamlObject;
}

export function resolveJsonPointer(document: unknown, reference: string, file: string): any {
  if (!reference.startsWith('#/')) throw new Error(`${file}: unsupported internal reference ${reference}`);
  return reference
    .slice(2)
    .split('/')
    .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce<any>((current, part) => {
      if (!current || !(part in current)) throw new Error(`${file}: reference ${reference} does not resolve`);
      return current[part];
    }, document);
}
