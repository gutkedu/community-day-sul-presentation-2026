import type { DomainSource } from './discover.js';
import { readYaml } from './yaml.js';

export interface AwsResourceModel {
  domainId: string;
  logicalId: string;
  type: string;
  references: string[];
  sourceFile: string;
}

export interface SamServiceModel {
  id: string;
  name: string;
  summary: string;
  version: string;
  domainId: string;
  logicalId: string;
  readsFrom: string[];
  writesTo: string[];
  sourceFile: string;
}

export interface DataStoreModel {
  id: string;
  name: string;
  summary: string;
  version: string;
  domainId: string;
  logicalId: string;
  containerType: 'database';
  technology: 'Amazon DynamoDB';
  sourceFile: string;
}

export interface SamModel {
  resources: AwsResourceModel[];
  services: SamServiceModel[];
  dataStores: DataStoreModel[];
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

function kebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function humanize(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim();
}

export function serviceIdForFunction(domainId: string, logicalId: string): string {
  const responsibility = kebabCase(logicalId.replace(/Function$/, ''));
  return responsibility.startsWith(`${domainId}-`) ? responsibility : `${domainId}-${responsibility}`;
}

function dataStoreIdForTable(domainId: string, logicalId: string): string {
  const resource = kebabCase(logicalId);
  return resource.startsWith(`${domainId}-`) ? resource : `${domainId}-${resource}`;
}

function referencedTables(value: unknown, tables: Map<string, DataStoreModel>): string[] {
  return [...collectReferences(value)]
    .map((logicalId) => tables.get(logicalId)?.id)
    .filter((id): id is string => Boolean(id));
}

function dataStoreAccess(policies: unknown, tables: Map<string, DataStoreModel>): { readsFrom: string[]; writesTo: string[] } {
  const readsFrom = new Set<string>();
  const writesTo = new Set<string>();
  for (const policy of Array.isArray(policies) ? policies : []) {
    if (!policy || typeof policy !== 'object') continue;
    for (const [policyName, definition] of Object.entries(policy)) {
      const stores = referencedTables(definition, tables);
      if (policyName === 'DynamoDBReadPolicy') stores.forEach((id) => readsFrom.add(id));
      if (policyName === 'DynamoDBCrudPolicy') {
        stores.forEach((id) => readsFrom.add(id));
        stores.forEach((id) => writesTo.add(id));
      }
      if (policyName !== 'Statement') continue;
      for (const statement of Array.isArray(definition) ? definition : [definition]) {
        const actions = (Array.isArray((statement as any)?.Action) ? (statement as any).Action : [(statement as any)?.Action])
          .filter(Boolean)
          .map((action: unknown) => String(action).toLowerCase());
        const referenced = referencedTables((statement as any)?.Resource, tables);
        if (actions.some((action: string) => /dynamodb:(get|batchget|query|scan)/.test(action))) referenced.forEach((id) => readsFrom.add(id));
        if (actions.some((action: string) => /dynamodb:(put|update|delete|batchwrite|transactwrite)/.test(action))) referenced.forEach((id) => writesTo.add(id));
      }
    }
  }
  return { readsFrom: [...readsFrom].sort(), writesTo: [...writesTo].sort() };
}

export async function parseSam(source: DomainSource, domainId: string, version: string): Promise<SamModel> {
  const document = await readYaml(source.files['template.yaml']);
  if (document.Transform !== 'AWS::Serverless-2016-10-31') {
    throw new Error(`${source.files['template.yaml']}: Transform must be AWS::Serverless-2016-10-31`);
  }
  if (!document.Resources || typeof document.Resources !== 'object') {
    throw new Error(`${source.files['template.yaml']}: Resources must be an object`);
  }

  const entries = Object.entries<any>(document.Resources).sort(([left], [right]) => left.localeCompare(right));
  const resources = entries.map(([logicalId, definition]) => {
    if (!definition?.Type || typeof definition.Type !== 'string') {
      throw new Error(`${source.files['template.yaml']}: Resources.${logicalId}.Type is required`);
    }
    return {
      domainId,
      logicalId,
      type: definition.Type,
      references: [...collectReferences(definition)].sort(),
      sourceFile: source.files['template.yaml'],
    } satisfies AwsResourceModel;
  });

  const dataStores = entries
    .filter(([, definition]) => definition.Type === 'AWS::DynamoDB::Table')
    .map(([logicalId]) => ({
      id: dataStoreIdForTable(domainId, logicalId),
      name: humanize(logicalId),
      summary: `Tabela DynamoDB do domínio ${humanize(domainId)}.`,
      version,
      domainId,
      logicalId,
      containerType: 'database' as const,
      technology: 'Amazon DynamoDB' as const,
      sourceFile: source.files['template.yaml'],
    }));
  const dataStoresByLogicalId = new Map(dataStores.map((dataStore) => [dataStore.logicalId, dataStore]));

  const services = entries
    .filter(([, definition]) => definition.Type === 'AWS::Serverless::Function')
    .map(([logicalId, definition]) => {
      const access = dataStoreAccess(definition.Properties?.Policies, dataStoresByLogicalId);
      return {
        id: serviceIdForFunction(domainId, logicalId),
        name: humanize(logicalId.replace(/Function$/, '')),
        summary: `Lambda ${logicalId} do domínio ${humanize(domainId)}.`,
        version,
        domainId,
        logicalId,
        ...access,
        sourceFile: source.files['template.yaml'],
      } satisfies SamServiceModel;
    });

  return { resources, services, dataStores };
}
