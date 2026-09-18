import { access } from 'node:fs/promises';
import path from 'node:path';
import { DiagnosticSeverity, fromFile, Parser } from '@asyncapi/parser';
import type { DomainSource } from './discover.js';
import { serviceIdForFunction } from './parse-sam.js';
import { readYaml, resolveJsonPointer, type YamlObject } from './yaml.js';

export interface MessageModel {
  id: string;
  name: string;
  summary: string;
  kind: 'command' | 'event';
  version: string;
  wireName: string;
  producerDomainId: string;
  producerServiceId: string;
  channelId: string;
  payload: unknown;
  example?: unknown;
  sourceFile: string;
}

export interface MessageRelationship {
  messageId: string;
  serviceId: string;
  domainId: string;
  direction: 'send' | 'receive';
  resourceLogicalId: string;
  channelId: string;
  sourceFile: string;
}

export interface ChannelModel {
  id: string;
  name: string;
  summary: string;
  version: string;
  address: string;
  protocol: string;
  resourceDomainId: string;
  resourceLogicalId: string;
  sourceFile: string;
}

export interface AsyncApiModel {
  messages: MessageModel[];
  relationships: MessageRelationship[];
  channels: ChannelModel[];
}

function referencedMessageId(reference: string): string {
  const tail = reference.split('#')[1] ?? reference;
  return decodeURIComponent(tail.split('/').filter(Boolean).at(-1) ?? '');
}

async function validateReferences(value: unknown, currentFile: string, architectureRoot: string): Promise<void> {
  if (Array.isArray(value)) {
    for (const item of value) await validateReferences(item, currentFile, architectureRoot);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === '$ref' && typeof child === 'string' && !child.startsWith('#') && !/^https?:/.test(child)) {
      const referencedFile = path.resolve(path.dirname(currentFile), child.split('#')[0]);
      const relative = path.relative(architectureRoot, referencedFile);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${currentFile}: reference ${child} is outside architecture/`);
      try {
        await access(referencedFile);
      } catch {
        throw new Error(`${currentFile}: reference ${child} does not exist`);
      }
    }
    await validateReferences(child, currentFile, architectureRoot);
  }
}

function resolveMessage(document: YamlObject, reference: string | undefined, file: string): any {
  if (!reference) return undefined;
  if (reference.startsWith('#/')) return resolveJsonPointer(document, reference, file);
  return { name: referencedMessageId(reference), $ref: reference };
}

export async function parseAsyncApi(
  source: DomainSource,
  architectureRoot: string,
  domainId: string,
  serviceName: string,
  version: string,
): Promise<AsyncApiModel> {
  const file = source.files['asyncapi.yaml'];
  const document = await readYaml(file);
  await validateReferences(document, file, architectureRoot);
  const parser = new Parser();
  const parsed = await fromFile(parser, file).parse();
  const errors = parsed.diagnostics.filter((diagnostic) => diagnostic.severity === DiagnosticSeverity.Error);
  if (!parsed.document || errors.length > 0) {
    const details = errors.map((diagnostic) => `${diagnostic.path.join('.')}: ${diagnostic.message}`).join('; ');
    throw new Error(`${file}: invalid AsyncAPI specification: ${details || 'document could not be parsed'}`);
  }
  if (!String(document.asyncapi ?? '').startsWith('3.0.')) throw new Error(`${file}: asyncapi must be version 3.0`);
  if (!String(document.info?.title ?? '').startsWith(serviceName)) throw new Error(`${file}: AsyncAPI title must be compatible with service ${serviceName}`);
  if (document.info?.version !== version) throw new Error(`${file}: AsyncAPI info.version must match ${version}`);

  const channels = Object.entries<any>(document.channels ?? {}).map(([, channel]) => {
    const resource = channel['x-architecture-resource'];
    if (!resource?.logicalId) throw new Error(`${file}: channels.*.x-architecture-resource.logicalId is required`);
    const protocol = channel['x-protocol'];
    if (protocol !== 'eventbridge' && protocol !== 'sqs') {
      throw new Error(`${file}: channels.*.x-protocol must be eventbridge or sqs`);
    }
    return {
      id: channel.address,
      name: channel.title ?? channel.address,
      summary: channel.description ?? `Canal ${channel.address}`,
      version,
      address: channel.address,
      protocol,
      resourceDomainId: resource.domain ?? domainId,
      resourceLogicalId: resource.logicalId,
      sourceFile: file,
    } satisfies ChannelModel;
  });

  const relationships: MessageRelationship[] = [];
  for (const [operationId, operation] of Object.entries<any>(document.operations ?? {})) {
    if (operation.action !== 'send' && operation.action !== 'receive') throw new Error(`${file}: operations.${operationId}.action must be send or receive`);
    const logicalId = operation['x-architecture-resource']?.logicalId;
    if (!logicalId) throw new Error(`${file}: operations.${operationId}.x-architecture-resource.logicalId is required`);
    const channelReference = operation.channel?.$ref;
    const channelDefinition = resolveMessage(document, channelReference, file);
    const channelId = channelDefinition?.address;
    if (!channelId || !channels.some((channel) => channel.id === channelId)) throw new Error(`${file}: operations.${operationId}.channel is unknown`);
    for (const messagePointer of operation.messages ?? []) {
      const messageReference = messagePointer.$ref;
      const messageDefinition = resolveMessage(document, messageReference, file);
      const messageId = messageDefinition?.name ?? referencedMessageId(messageReference);
      if (!messageId) throw new Error(`${file}: operations.${operationId}.messages contains an unresolved message`);
      relationships.push({
        messageId,
        serviceId: serviceIdForFunction(domainId, logicalId),
        domainId,
        direction: operation.action,
        resourceLogicalId: logicalId,
        channelId,
        sourceFile: file,
      });
    }
  }

  const messages = Object.entries<any>(document.components?.messages ?? {}).map(([componentId, message]) => {
    const kind = message['x-kind'];
    if (kind !== 'command' && kind !== 'event') {
      throw new Error(`${file}: components.messages.${componentId}.x-kind must be command or event`);
    }
    const channelDefinition = Object.values<any>(document.channels ?? {}).find((candidate) => candidate.messages?.[componentId]);
    const channelId = channelDefinition?.address;
    if (!channelId) throw new Error(`${file}: components.messages.${componentId} has no known channel`);
    const messageId = message.name;
    const producer = relationships.find((relationship) => relationship.messageId === messageId && relationship.direction === 'send');
    if (!producer) throw new Error(`${file}: components.messages.${componentId} has no send operation`);
    const payload = message.payload?.$ref ? resolveJsonPointer(document, message.payload.$ref, file) : message.payload;
    return {
      id: messageId,
      name: message.title ?? messageId,
      summary: message.summary ?? message.title ?? messageId,
      kind,
      version,
      wireName: message['x-wire-name'],
      producerDomainId: producer.domainId,
      producerServiceId: producer.serviceId,
      channelId,
      payload,
      example: message.examples?.[0]?.payload,
      sourceFile: file,
    } satisfies MessageModel;
  });
  return { messages, relationships, channels };
}
