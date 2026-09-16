import type { DomainSource } from './discover.js';
import { readYaml } from './yaml.js';

export interface AwsResourceModel {
  domainId: string;
  logicalId: string;
  type: string;
  references: string[];
  sourceFile: string;
}

function collectReferences(value: unknown, references = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((item) => collectReferences(item, references));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'Ref' && typeof child === 'string') references.add(child);
      if (key === 'Fn::GetAtt' && Array.isArray(child) && typeof child[0] === 'string') references.add(child[0]);
      collectReferences(child, references);
    }
  }
  return references;
}

export async function parseSam(source: DomainSource, domainId: string): Promise<AwsResourceModel[]> {
  const document = await readYaml(source.files['template.yaml']);
  if (document.Transform !== 'AWS::Serverless-2016-10-31') {
    throw new Error(`${source.files['template.yaml']}: Transform must be AWS::Serverless-2016-10-31`);
  }
  if (!document.Resources || typeof document.Resources !== 'object') {
    throw new Error(`${source.files['template.yaml']}: Resources must be an object`);
  }
  return Object.entries(document.Resources)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([logicalId, definition]: [string, any]) => {
      if (!definition?.Type || typeof definition.Type !== 'string') {
        throw new Error(`${source.files['template.yaml']}: Resources.${logicalId}.Type is required`);
      }
      return {
        domainId,
        logicalId,
        type: definition.Type,
        references: [...collectReferences(definition)].sort(),
        sourceFile: source.files['template.yaml'],
      };
    });
}
