import type { CatalogModel } from './model.js';

function assertUnique<T>(items: T[], key: (item: T) => string, label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    const id = key(item);
    if (seen.has(id)) throw new Error(`duplicate ${label} ${id}`);
    seen.add(id);
  }
}

export function validateModel(model: CatalogModel): CatalogModel {
  assertUnique(model.domains, (domain) => domain.id, 'domain');
  assertUnique(model.services, (service) => service.id, 'service');
  assertUnique(model.operations, (operation) => operation.id, 'operationId');
  assertUnique(model.messages, (message) => message.id, 'message.name');
  assertUnique(model.channels, (channel) => channel.id, 'channel');

  const domains = new Set(model.domains.map((domain) => domain.id));
  const services = new Set(model.services.map((service) => service.id));
  const messages = new Map(model.messages.map((message) => [message.id, message]));
  const channels = new Set(model.channels.map((channel) => channel.id));
  const resources = new Set(model.awsResources.map((resource) => `${resource.domainId}:${resource.logicalId}`));

  for (const operation of model.operations) {
    if (!domains.has(operation.domainId) || !services.has(operation.serviceId)) throw new Error(`${operation.sourceFile}: operation ${operation.id} references an unknown domain or service`);
    if (!resources.has(`${operation.domainId}:${operation.resourceLogicalId}`)) {
      throw new Error(`${operation.sourceFile}: operation ${operation.id} references missing SAM resource ${operation.resourceLogicalId}`);
    }
    for (const outcome of operation.outcomes) {
      if (!messages.has(outcome)) throw new Error(`${operation.sourceFile}: outcome ${outcome} is unknown`);
      if (operation.kind !== 'command') throw new Error(`${operation.sourceFile}: outcome ${outcome} is incompatible with ${operation.kind} ${operation.id}`);
    }
  }

  for (const message of model.messages) {
    const wireMajor = message.wireName?.match(/\.v(\d+)$/)?.[1];
    const resourceMajor = message.version.split('.')[0];
    if (!wireMajor || wireMajor !== resourceMajor) throw new Error(`${message.sourceFile}: wire version ${message.wireName} is incompatible with resource version ${message.version}`);
    if (!services.has(message.producerServiceId)) throw new Error(`${message.sourceFile}: producer ${message.producerServiceId} is unknown`);
  }

  for (const relationship of model.relationships) {
    if (!messages.has(relationship.messageId)) throw new Error(`${relationship.sourceFile}: message ${relationship.messageId} is unknown`);
    if (!services.has(relationship.serviceId)) throw new Error(`${relationship.sourceFile}: service ${relationship.serviceId} is unknown`);
    if (!channels.has(relationship.channelId)) throw new Error(`${relationship.sourceFile}: channel ${relationship.channelId} is unknown`);
    if (!resources.has(`${relationship.domainId}:${relationship.resourceLogicalId}`)) {
      throw new Error(`${relationship.sourceFile}: relationship references missing SAM resource ${relationship.resourceLogicalId}`);
    }
    const message = messages.get(relationship.messageId)!;
    if (relationship.direction === 'send' && relationship.serviceId !== message.producerServiceId) {
      throw new Error(`${relationship.sourceFile}: send direction is incompatible with producer ${message.producerServiceId}`);
    }
  }

  for (const channel of model.channels) {
    if (!resources.has(`${channel.resourceDomainId}:${channel.resourceLogicalId}`)) {
      throw new Error(`${channel.sourceFile}: channel references missing SAM resource ${channel.resourceLogicalId}`);
    }
  }
  return model;
}
