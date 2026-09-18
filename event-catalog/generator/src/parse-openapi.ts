import SwaggerParser from '@apidevtools/swagger-parser';
import type { DomainSource } from './discover.js';
import { serviceIdForFunction } from './parse-sam.js';
import { readYaml, resolveJsonPointer, type YamlObject } from './yaml.js';

export type OperationKind = 'command' | 'query';

export interface OperationModel {
  id: string;
  name: string;
  summary: string;
  kind: OperationKind;
  domainId: string;
  serviceId: string;
  version: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  statusCodes: string[];
  outcomes: string[];
  resourceLogicalId: string;
  schema?: unknown;
  example?: unknown;
  sourceFile: string;
}

function dereferenceSchema(document: YamlObject, schema: any, file: string): unknown {
  if (!schema) return undefined;
  if (schema.$ref && typeof schema.$ref === 'string') return resolveJsonPointer(document, schema.$ref, file);
  return schema;
}

export async function parseOpenApi(source: DomainSource, domainId: string, serviceName: string, version: string): Promise<OperationModel[]> {
  const file = source.files['openapi.yaml'];
  try {
    await SwaggerParser.validate(file);
  } catch (error) {
    throw new Error(`${file}: invalid OpenAPI specification: ${error instanceof Error ? error.message : String(error)}`);
  }
  const document = await readYaml(file);
  if (!String(document.openapi ?? '').startsWith('3.1.')) throw new Error(`${file}: openapi must be version 3.1`);
  if (!String(document.info?.title ?? '').startsWith(serviceName)) throw new Error(`${file}: OpenAPI title must be compatible with service ${serviceName}`);
  if (document.info?.version !== version) throw new Error(`${file}: OpenAPI info.version must match ${version}`);
  const operations: OperationModel[] = [];
  for (const [route, pathItem] of Object.entries<any>(document.paths ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      const operation = pathItem?.[method];
      if (!operation) continue;
      const field = `paths.${route}.${method}`;
      if (!operation.operationId) throw new Error(`${file}: ${field}.operationId is required`);
      const kind = operation['x-kind'];
      if (kind !== 'command' && kind !== 'query') {
        throw new Error(`${file}: ${field}.x-kind must be command or query; HTTP operations cannot define events`);
      }
      const resourceLogicalId = operation['x-architecture-resource']?.logicalId;
      if (!resourceLogicalId) throw new Error(`${file}: ${field}.x-architecture-resource.logicalId is required`);
      const requestContent = operation.requestBody?.content?.['application/json'];
      const successResponse = Object.entries<any>(operation.responses ?? {}).find(([status]) => status.startsWith('2'))?.[1];
      const responseContent = successResponse?.content?.['application/json'];
      const content = kind === 'command' ? requestContent : responseContent;
      operations.push({
        id: operation.operationId,
        name: operation.operationId.replace(/([a-z0-9])([A-Z])/g, '$1 $2'),
        summary: operation.summary ?? `${method.toUpperCase()} ${route}`,
        kind,
        domainId,
        serviceId: serviceIdForFunction(domainId, resourceLogicalId),
        version,
        method: method.toUpperCase() as OperationModel['method'],
        path: route,
        statusCodes: Object.keys(operation.responses ?? {}).sort(),
        outcomes: operation['x-architecture-outcomes'] ?? [],
        resourceLogicalId,
        schema: dereferenceSchema(document, content?.schema, file),
        example: content?.example,
        sourceFile: file,
      });
    }
  }
  return operations;
}
