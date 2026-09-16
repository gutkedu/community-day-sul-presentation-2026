import { z } from 'zod';
import { discoverSources, type DomainSource } from './discover.js';
import { parseAsyncApi, type ChannelModel, type MessageModel, type MessageRelationship } from './parse-asyncapi.js';
import { parseOpenApi, type OperationModel } from './parse-openapi.js';
import { parseSam, type AwsResourceModel } from './parse-sam.js';
import { validateModel } from './validate.js';
import { readYaml } from './yaml.js';

const ManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  summary: z.string().min(1),
  service: z.object({ id: z.string().min(1), name: z.string().min(1), version: z.string().regex(/^\d+\.\d+\.\d+$/) }),
  owners: z.array(z.string().min(1)).min(1),
});

export type DomainManifest = z.infer<typeof ManifestSchema>;
export interface DomainModel extends DomainManifest { source: DomainSource }
export interface ServiceModel {
  id: string;
  name: string;
  version: string;
  summary: string;
  domainId: string;
  owners: string[];
  source: DomainSource;
}

export interface CatalogModel {
  domains: DomainModel[];
  services: ServiceModel[];
  operations: OperationModel[];
  messages: MessageModel[];
  channels: ChannelModel[];
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
  const operations: OperationModel[] = [];
  const messages: MessageModel[] = [];
  const channels: ChannelModel[] = [];
  const awsResources: AwsResourceModel[] = [];
  const relationships: MessageRelationship[] = [];

  for (const source of sources) {
    const rawManifest = await readYaml(source.files['catalog.yaml']);
    const parsed = ManifestSchema.safeParse(rawManifest);
    if (!parsed.success) throw new Error(`${source.files['catalog.yaml']}: ${z.prettifyError(parsed.error)}`);
    const manifest = parsed.data;
    const domain: DomainModel = { ...manifest, source };
    domains.push(domain);
    services.push({
      ...manifest.service,
      domainId: manifest.id,
      summary: `Serviço responsável pelo domínio ${manifest.name}.`,
      owners: manifest.owners,
      source,
    });
    operations.push(...(await parseOpenApi(source, manifest.id, manifest.service.id, manifest.service.name, manifest.service.version)));
    awsResources.push(...(await parseSam(source, manifest.id)));
    const asyncModel = await parseAsyncApi(source, architectureRoot, manifest.id, manifest.service.id, manifest.service.name, manifest.service.version);
    messages.push(...asyncModel.messages);
    channels.push(...asyncModel.channels);
    relationships.push(...asyncModel.relationships);
  }

  const model: CatalogModel = {
    domains: domains.sort((a, b) => a.id.localeCompare(b.id)),
    services: services.sort((a, b) => a.id.localeCompare(b.id)),
    operations: operations.sort((a, b) => a.id.localeCompare(b.id)),
    messages: messages.sort((a, b) => a.id.localeCompare(b.id)),
    channels: deduplicateChannels(channels),
    awsResources: awsResources.sort((a, b) => `${a.domainId}:${a.logicalId}`.localeCompare(`${b.domainId}:${b.logicalId}`)),
    relationships: relationships.sort((a, b) => `${a.serviceId}:${a.direction}`.localeCompare(`${b.serviceId}:${b.direction}`)),
  };
  return validateModel(model);
}
