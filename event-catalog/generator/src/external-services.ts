import { realpath } from 'node:fs/promises';
import path from 'node:path';
import SwaggerParser from '@apidevtools/swagger-parser';
import { z } from 'zod';
import type { DomainSource } from './discover.js';
import type { OperationModel } from './parse-openapi.js';
import { readYaml } from './yaml.js';

const identifier = z.string().regex(/^[a-zA-Z0-9_-]+$/);
export const ExternalServicesSchema = z.array(z.object({
  id: identifier,
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  summary: z.string().min(1),
  specification: z.string().regex(/^[a-z0-9][a-z0-9-]*\.openapi\.yaml$/),
  consumers: z.array(identifier).min(1),
})).default([]);

type Declaration = z.infer<typeof ExternalServicesSchema>[number];
export type ExternalOperation = Omit<OperationModel, 'resourceLogicalId'>;
export interface ExternalServiceModel extends Declaration {
  domainId: string;
  owners: string[];
  sourceFile: string;
  operations: ExternalOperation[];
}

function assertLocalReferences(value: unknown, file: string): void {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === '$ref' && (typeof child !== 'string' || !child.startsWith('#/'))) {
      throw new Error(`${file}: external specifications must use document-local $ref values`);
    }
    assertLocalReferences(child, file);
  }
}

export async function parseExternalServices(source: DomainSource, domainId: string, owners: string[], declarations: Declaration[]): Promise<ExternalServiceModel[]> {
  const result: ExternalServiceModel[] = [];
  for (const declaration of declarations) {
    const file = path.join(source.directory, declaration.specification);
    const resolved = await realpath(file);
    if (path.dirname(resolved) !== await realpath(source.directory)) throw new Error(`${file}: specification is outside its domain directory`);
    assertLocalReferences(await readYaml(file), file);
    const document: any = await SwaggerParser.validate(file, { resolve: { external: false } });
    if (!String(document.openapi).startsWith('3.1.')) throw new Error(`${file}: openapi must be version 3.1`);
    if (document.info.title !== declaration.name) throw new Error(`${file}: OpenAPI title must match ${declaration.name}`);
    if (document.info.version !== declaration.version) throw new Error(`${file}: OpenAPI info.version must match ${declaration.version}`);
    const operations: ExternalOperation[] = [];
    for (const [route, pathItem] of Object.entries<any>(document.paths).sort(([a], [b]) => a.localeCompare(b))) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const operation = pathItem[method];
        if (!operation) continue;
        const id = identifier.parse(operation.operationId);
        const kind = operation['x-kind'];
        if (kind !== 'command' && kind !== 'query') throw new Error(`${file}: paths.${route}.${method}.x-kind must be command or query`);
        const successResponse = Object.entries<any>(operation.responses).find(([status]) => status.startsWith('2'))?.[1];
        const content = (kind === 'command' ? operation.requestBody : successResponse)?.content?.['application/json'];
        operations.push({
          id, name: id.replace(/([a-z0-9])([A-Z])/g, '$1 $2'), kind,
          summary: operation.summary ?? `${method.toUpperCase()} ${route}`,
          domainId, serviceId: declaration.id, version: declaration.version,
          method: method.toUpperCase() as ExternalOperation['method'], path: route,
          statusCodes: Object.keys(operation.responses).sort(), outcomes: [],
          schema: content?.schema, example: content?.example, sourceFile: file,
        });
      }
    }
    if (!operations.length) throw new Error(`${file}: external specification must define at least one operation`);
    result.push({ ...declaration, domainId, owners, sourceFile: file, operations });
  }
  return result;
}
