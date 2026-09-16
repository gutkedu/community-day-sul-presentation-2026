import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import { parse } from 'yaml'

const templatePath = new URL('../template.yaml', import.meta.url)
function template() {
  assert.ok(existsSync(templatePath), 'a single SAM hosting template must exist')
  return parse(readFileSync(templatePath, 'utf8'))
}
function rewrite(site, uri) {
  const resource = template().Resources[`${site}RoutingFunction`]
  const context = vm.createContext({ event: { request: {
    uri, method: 'GET', headers: {}, cookies: {}, querystring: { clicks: { value: '2' } },
  } } })
  const result = vm.runInContext(`${resource.Properties.FunctionCode}\nhandler(event)`, context, { timeout: 1000 })
  assert.equal(result.querystring.clicks.value, '2')
  return result.uri
}

test('one stack owns two private, retained origins and two independent distributions', () => {
  const { Transform, Resources: resources, Outputs: outputs } = template()
  assert.equal(Transform, 'AWS::Serverless-2016-10-31')
  const count = type => Object.values(resources).filter(r => r.Type === type).length
  assert.equal(count('AWS::S3::Bucket'), 2)
  assert.equal(count('AWS::CloudFront::Distribution'), 2)
  assert.equal(count('AWS::CloudFront::OriginAccessControl'), 2)
  assert.equal(count('AWS::CloudFront::Function'), 2)
  assert.equal(count('AWS::CloudFormation::Stack'), 0)
  assert.equal(count('AWS::Serverless::Function'), 0)
  for (const site of ['Presentation', 'EventCatalog']) {
    const bucket = resources[`${site}Bucket`]
    assert.equal(bucket.DeletionPolicy, 'Retain')
    assert.equal(bucket.UpdateReplacePolicy, 'Retain')
    assert.equal(bucket.Properties.VersioningConfiguration.Status, 'Enabled')
    assert.equal(bucket.Properties.BucketEncryption.ServerSideEncryptionConfiguration[0].ServerSideEncryptionByDefault.SSEAlgorithm, 'AES256')
    assert.deepEqual(Object.values(bucket.Properties.PublicAccessBlockConfiguration), [true, true, true, true])
    assert.equal(bucket.Properties.OwnershipControls.Rules[0].ObjectOwnership, 'BucketOwnerEnforced')
    assert.equal(bucket.Properties.WebsiteConfiguration, undefined)
    const origin = resources[`${site}Distribution`].Properties.DistributionConfig.Origins[0]
    assert.deepEqual(origin.DomainName, { 'Fn::GetAtt': [`${site}Bucket`, 'RegionalDomainName'] })
    assert.deepEqual(origin.OriginAccessControlId, { Ref: `${site}OriginAccessControl` })
    const statements = resources[`${site}BucketPolicy`].Properties.PolicyDocument.Statement
    const allow = statements.find(s => s.Effect === 'Allow')
    assert.deepEqual(allow.Principal, { Service: 'cloudfront.amazonaws.com' })
    assert.equal(allow.Action, 's3:GetObject')
    assert.ok(allow.Condition.StringEquals['AWS:SourceArn']['Fn::Sub'].includes(`\${${site}Distribution}`))
    assert.equal(resources[`${site}OriginAccessControl`].Properties.OriginAccessControlConfig.SigningBehavior, 'always')
    const distribution = resources[`${site}Distribution`].Properties.DistributionConfig
    assert.equal(distribution.DefaultCacheBehavior.ViewerProtocolPolicy, 'redirect-to-https')
    assert.equal(distribution.DefaultCacheBehavior.Compress, true)
    assert.equal(distribution.ViewerCertificate.CloudFrontDefaultCertificate, true)
    assert.equal(distribution.CustomErrorResponses, undefined)
    for (const suffix of ['BucketName', 'DistributionId', 'Url']) assert.ok(outputs[`${site}${suffix}`])
  }
  assert.equal(resources.StaticCachePolicy.Properties.CachePolicyConfig.MinTTL, 0)
})

test('Slidev deep links load the SPA without rewriting missing static assets', () => {
  for (const uri of ['/', '/1', '/29', '/presenter/12', '/presenter/12/', '/overview', '/notes/3']) {
    assert.equal(rewrite('Presentation', uri), '/index.html', uri)
  }
  for (const uri of ['/index.html', '/assets/missing.js', '/aws/lambda.png', '/absent.pdf', '/_redirects']) {
    assert.equal(rewrite('Presentation', uri), uri)
  }
})

test('catalog page routes include dotted versions and JSON example pages', () => {
  for (const route of [
    '/docs/events/OrderCreated/1.0.0',
    '/docs/services/orders-service/1.0.0/spec/openapi',
    '/visualiser/events/OrderCreated/1.0.0',
    '/docs/events/OrderCreated/1.0.0-beta.1',
    '/docs/commands/CreateOrder/1.0.0/examples/example.json',
    '/docs/queries/GetOrderById/1.0.0/examples/example.json',
    '/discover/services',
  ]) {
    assert.equal(rewrite('EventCatalog', route), `${route}/index.html`, route)
    assert.equal(rewrite('EventCatalog', `${route}/`), `${route}/index.html`, route)
  }
  assert.equal(rewrite('EventCatalog', '/'), '/index.html')
})

test('catalog downloads keep their exact paths and missing files do not become home pages', () => {
  for (const uri of [
    '/generated/events/OrderCreated/examples/example.json',
    '/generated/services/orders-service/openapi.yaml',
    '/openapi.yml', '/api/search-index.json', '/llms.txt',
    '/docs/events/OrderCreated/1.0.0.md', '/docs/events/OrderCreated/1.0.0.mdx',
    '/visualiser/events/OrderCreated/1.0.0.mermaid',
    '/docs/events/OrderCreated/1.0.0/index.html', '/_astro/missing.js', '/missing.png',
    '/.well-known/api-catalog', '/api/settings/ai', '/api/settings/general', '/api/settings/logo',
    '/api-catalog/specifications/services/orders-service/1.0.0/openapi-b3BlbmFwaS55YW1s',
  ]) assert.equal(rewrite('EventCatalog', uri), uri)
})
