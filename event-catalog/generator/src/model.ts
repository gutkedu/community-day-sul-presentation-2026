import { z } from 'zod';
import { discoverSources, type DomainSource } from './discover.js';
import { parseAsyncApi, type ChannelModel, type MessageModel, type MessageRelationship } from './parse-asyncapi.js';
import { parseOpenApi, type OperationModel } from './parse-openapi.js';
import { parseSam, type AwsResourceModel, type DataStoreModel, type SamServiceModel } from './parse-sam.js';
import { validateModel } from './validate.js';
import { readYaml } from './yaml.js';
import { ExternalServicesSchema, parseExternalServices, type ExternalServiceModel } from './external-services.js';

const ManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  summary: z.string().min(1),
  owners: z.array(z.string().min(1)).min(1),
  externalServices: ExternalServicesSchema,
});

export type DomainManifest = z.infer<typeof ManifestSchema>;
export interface DomainModel extends DomainManifest { source: DomainSource }
export interface ServiceModel extends SamServiceModel {
  owners: string[];
  source: DomainSource;
}

export interface CatalogModel {
  domains: DomainModel[];
  services: ServiceModel[];
  externalServices: ExternalServiceModel[];
  operations: OperationModel[];
  messages: MessageModel[];
  channels: ChannelModel[];
  dataStores: DataStoreModel[];
  awsResources: AwsResourceModel[];
  relationships: MessageRelationship[];
}

function deduplicateChannels(channels: ChannelModel[]): ChannelModel[] {
  const result = new Map<string, ChannelModel>();
  for (const channel of channels) {
    const existing = result.get(channel.id);
    if (!existing || channel.resourceDomainId === channel.sourceFile.split('/').at(-2)) result.set(channel.id, channel);
  }
  return [...result.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export async function buildCatalogModel(architectureRoot: string): Promise<CatalogModel> {
  const sources = await discoverSources(architectureRoot);
  const domains: DomainModel[] = [];
  const services: ServiceModel[] = [];
  const externalServices: ExternalServiceModel[] = [];
  const operations: OperationModel[] = [];
  const messages: MessageModel[] = [];
  const channels: ChannelModel[] = [];
  const dataStores: DataStoreModel[] = [];
  const awsResources: AwsResourceModel[] = [];
  const relationships: MessageRelationship[] = [];

  for (const source of sources) {
    const rawManifest = await readYaml(source.files['catalog.yaml']);
    const parsed = ManifestSchema.safeParse(rawManifest);
    if (!parsed.success) throw new Error(`${source.files['catalog.yaml']}: ${z.prettifyError(parsed.error)}`);
    const manifest = parsed.data;
    const domain: DomainModel = { ...manifest, source };
    domains.push(domain);
    const sam = await parseSam(source, manifest.id, manifest.version);
    services.push(...sam.services.map((service) => ({ ...service, owners: manifest.owners, source })));
    externalServices.push(...await parseExternalServices(source, manifest.id, manifest.owners, manifest.externalServices));
    dataStores.push(...sam.dataStores);
    awsResources.push(...sam.resources);
    const serviceTitle = `${manifest.name} Service`;
    operations.push(...(await parseOpenApi(source, manifest.id, serviceTitle, manifest.version)));
    const asyncModel = await parseAsyncApi(source, architectureRoot, manifest.id, serviceTitle, manifest.version);
    messages.push(...asyncModel.messages);
    channels.push(...asyncModel.channels);
    relationships.push(...asyncModel.relationships);
  }

  const model: CatalogModel = {
    domains: domains.sort((a, b) => a.id.localeCompare(b.id)),
    services: services.sort((a, b) => a.id.localeCompare(b.id)),
    externalServices: externalServices.sort((a, b) => a.id.localeCompare(b.id)),
    operations: operations.sort((a, b) => a.id.localeCompare(b.id)),
    messages: messages.sort((a, b) => a.id.localeCompare(b.id)),
    channels: deduplicateChannels(channels),
    dataStores: dataStores.sort((a, b) => a.id.localeCompare(b.id)),
    awsResources: awsResources.sort((a, b) => `${a.domainId}:${a.logicalId}`.localeCompare(`${b.domainId}:${b.logicalId}`)),
    relationships: relationships.sort((a, b) => `${a.serviceId}:${a.direction}`.localeCompare(`${b.serviceId}:${b.direction}`)),
  };
  return validateModel(model);
}
