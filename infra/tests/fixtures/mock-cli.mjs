import { appendFileSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export function runMock(command) {
  const args = process.argv.slice(2)
  const scenario = process.env.DEPLOY_TEST_SCENARIO
  const record = { command, args, cwd: process.cwd() }
  if (command === 'aws' && args[0] === 's3' && args[1] === 'sync') {
    record.files = readdirSync(args[2], { recursive: true }).filter(f => !f.endsWith('/'))
    record.index = record.files.includes('index.html') ? readFileSync(path.join(args[2], 'index.html'), 'utf8') : null
  }
  appendFileSync(process.env.DEPLOY_TEST_LOG, `${JSON.stringify(record)}\n`)
  if (command === 'npm') {
    const site = path.basename(process.cwd())
    if (args.includes('build') || args.includes('verify')) {
      if (scenario === 'build-failure' || (scenario === 'catalog-build-failure' && site === 'event-catalog')) process.exit(1)
      if (scenario === 'empty-build') return
      const files = site === 'presentation'
        ? { 'index.html': '<h1>fresh presentation</h1>', 'assets/deck-Abcd1234.js': 'export default 1', 'logo.png': 'image' }
        : { 'index.html': '<h1>fresh catalog</h1>', '_astro/page.Abcd1234.js': 'export default 1', 'api/search-index.json': '{}', 'docs/events/OrderCreated/1.0.0/index.html': '<h1>event</h1>', 'generated/events/OrderCreated/schema.json': '{}' }
      for (const [name, body] of Object.entries(files)) {
        const file = path.join(process.cwd(), 'dist', name)
        mkdirSync(path.dirname(file), { recursive: true })
        writeFileSync(file, body)
      }
    }
    return
  }
  if (command === 'sam') {
    if (args[0] === 'deploy' && scenario === 'sam-failure') process.exit(1)
    if (args[0] === 'deploy' && scenario === 'empty-changeset') {
      if (!args.includes('--no-fail-on-empty-changeset')) process.exit(1)
      console.log('No changes to deploy. Stack is up to date')
    }
    return
  }
  if (args[0] === 'sts') {
    console.log(JSON.stringify({ Account: '123456789012', Arn: 'arn:aws:iam::123456789012:user/test', UserId: 'test' }))
  } else if (args[0] === 'cloudformation' && args[1] === 'get-template') {
    let template = readFileSync(path.join(process.cwd(), 'infra', 'template.yaml'), 'utf8')
    if (scenario.startsWith('sam-metadata')) {
      template = template.replace(/^(  (\w+):\n    Type:[^\n]+\n)/gm, '$1    Metadata:\n      SamResourceId: $2\n')
      if (scenario === 'sam-metadata-changed') template = template.replace('Status: Enabled', 'Status: Suspended')
      if (scenario === 'sam-metadata-extra') template = template.replace('SamResourceId: PresentationBucket', 'SamResourceId: PresentationBucket\n      Unexpected: true')
      if (scenario === 'sam-metadata-wrong-id') template = template.replace('SamResourceId: PresentationBucket', 'SamResourceId: DifferentBucket')
    }
    console.log(JSON.stringify({ TemplateBody: scenario === 'sam-cancelled' || scenario === 'template-outdated' ? 'Resources: {}' : template }))
  } else if (args[0] === 'cloudformation') {
    if (scenario === 'stack-missing') process.exit(1)
    const outputs = {
      PresentationBucketName: scenario === 'bad-output' ? 'wrong-bucket/other-prefix' : 'demo-presentation-bucket',
      PresentationDistributionId: 'EPRESENTATION12', PresentationUrl: 'https://d11111111111111.cloudfront.net',
      EventCatalogBucketName: 'demo-catalog-bucket', EventCatalogDistributionId: 'ECATALOG1234567',
      EventCatalogUrl: 'https://d22222222222222.cloudfront.net',
    }
    console.log(JSON.stringify({ Stacks: [{ StackName: 'community-day-sul-presentation-2026', StackStatus: 'CREATE_COMPLETE', Outputs: Object.entries(outputs).map(([OutputKey, OutputValue]) => ({ OutputKey, OutputValue })) }] }))
  } else if (args[0] === 's3') {
    if (scenario === 'upload-failure') process.exit(1)
  } else if (args[0] === 'cloudfront' && args[1] === 'create-invalidation') {
    console.log(JSON.stringify({ Invalidation: { Id: 'ITEST123', Status: 'InProgress', InvalidationBatch: { CallerReference: 'test', Paths: { Quantity: 1, Items: ['/*'] } } } }))
  } else if (args[0] !== 'cloudfront' || args[1] !== 'wait') {
    console.error(`Unexpected AWS call: ${args.join(' ')}`)
    process.exit(2)
  }
}
