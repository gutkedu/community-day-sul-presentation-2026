import assert from 'node:assert/strict'
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

const infra = fileURLToPath(new URL('..', import.meta.url))
async function invoke(target, scenario = '', extra = []) {
  const wrapper = path.join(infra, 'scripts', `deploy-${target}.sh`)
  assert.ok(existsSync(wrapper), `${path.basename(wrapper)} must exist`)
  const temporary = await mkdtemp(path.join(tmpdir(), 'community-day-deploy-test-'))
  try {
    const project = path.join(temporary, 'project with spaces')
    await cp(infra, path.join(project, 'infra'), { recursive: true, filter: p => !['node_modules', 'tests'].includes(path.basename(p)) })
    await symlink(path.join(infra, 'node_modules'), path.join(project, 'infra', 'node_modules'), 'dir')
    for (const site of ['presentation', 'event-catalog']) await mkdir(path.join(project, site), { recursive: true })
    const bin = path.join(temporary, 'bin')
    await mkdir(bin)
    await cp(new URL('fixtures/mock-cli.mjs', import.meta.url), path.join(bin, 'mock-cli.mjs'))
    for (const command of ['npm', 'sam', 'aws']) {
      await writeFile(path.join(bin, command), `#!/usr/bin/env node\nimport { runMock } from './mock-cli.mjs'; runMock('${command}');\n`, { mode: 0o755 })
    }
    const log = path.join(temporary, 'calls.jsonl')
    await writeFile(log, '')
    const args = extra.length ? extra : ['--region', 'us-east-1', '--profile', 'demo']
    const result = spawnSync('bash', [path.join(project, 'infra', 'scripts', `deploy-${target}.sh`), ...args], {
      cwd: temporary, encoding: 'utf8', timeout: 30000,
      env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, DEPLOY_TEST_LOG: log, DEPLOY_TEST_SCENARIO: scenario },
    })
    const calls = (await readFile(log, 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line))
    return { ...result, calls }
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
}
const uploads = calls => calls.filter(c => c.command === 'aws' && c.args[0] === 's3')
const invalidations = calls => calls.filter(c => c.command === 'aws' && c.args[1] === 'create-invalidation')
const deployments = calls => calls.filter(c => c.command === 'sam' && c.args[0] === 'deploy')
function succeeded(result) { assert.equal(result.status, 0, result.stderr || result.stdout || String(result.error)) }

test('help works without an AWS region and missing/unknown flags fail before any commands', async () => {
  succeeded(await invoke('all', '', ['--help']))
  for (const args of [[], ['--profile', 'demo'], ['--region'], ['--region', 'us-east-1', '--unknown']]) {
    const result = await invoke('all', '', args.length ? args : ['--stack-name', 'demo'])
    assert.notEqual(result.status, 0)
    assert.equal(result.calls.length, 0)
  }
})

test('presentation deploy publishes assets before HTML, only to its own bucket/distribution', async () => {
  const result = await invoke('presentation')
  succeeded(result)
  const syncs = uploads(result.calls)
  assert.equal(syncs.length, 3)
  assert.ok(syncs.every(c => c.args.includes('s3://demo-presentation-bucket/')))
  assert.match(syncs[0].args[syncs[0].args.indexOf('--cache-control') + 1], /immutable/)
  assert.ok(syncs[0].files.includes('assets/deck-Abcd1234.js'))
  assert.ok(syncs[1].files.includes('logo.png'))
  assert.equal(syncs[2].index, '<h1>fresh presentation</h1>')
  assert.ok(syncs.every(c => !c.args.includes('--delete')))
  assert.equal(deployments(result.calls).length, 0)
  assert.equal(invalidations(result.calls).length, 1)
  assert.ok(invalidations(result.calls)[0].args.includes('EPRESENTATION12'))
  assert.ok(result.calls.some(c => c.args.includes('invalidation-completed')))
  assert.ok(result.calls.filter(c => c.command === 'aws').every(c => c.args.includes('us-east-1') && c.args.includes('demo')))
  assert.ok(!result.calls.some(c => c.command === 'npm' && c.cwd.endsWith('event-catalog')))
})

test('catalog deploy generates and lints contracts and publishes only its own frontend', async () => {
  const result = await invoke('event-catalog')
  succeeded(result)
  assert.ok(result.calls.some(c => c.command === 'npm' && c.args.includes('generate')))
  assert.ok(result.calls.some(c => c.command === 'npm' && c.args.includes('lint')))
  assert.ok(uploads(result.calls).every(c => c.args.includes('s3://demo-catalog-bucket/')))
  assert.ok(invalidations(result.calls)[0].args.includes('ECATALOG1234567'))
  assert.equal(deployments(result.calls).length, 0)
})

test('all validates/builds both projects before changing AWS and deploys the stack once', async () => {
  const result = await invoke('all')
  succeeded(result)
  assert.equal(deployments(result.calls).length, 1)
  const deployIndex = result.calls.indexOf(deployments(result.calls)[0])
  for (const site of ['presentation', 'event-catalog']) {
    assert.ok(result.calls.findIndex(c => c.command === 'npm' && c.cwd.endsWith(site) && c.args.includes('build')) < deployIndex)
  }
  assert.ok(deployments(result.calls)[0].args.includes('--confirm-changeset'))
  assert.ok(deployments(result.calls)[0].args.includes('--no-fail-on-empty-changeset'))
  assert.equal(invalidations(result.calls).length, 2)
})

test('infrastructure-only deploy never builds or uploads a frontend; empty change sets succeed', async () => {
  const result = await invoke('infra', 'empty-changeset')
  succeeded(result)
  assert.equal(deployments(result.calls).length, 1)
  assert.equal(uploads(result.calls).length, 0)
  assert.equal(invalidations(result.calls).length, 0)
  assert.ok(!result.calls.some(c => c.command === 'npm' && c.args.includes('build')))
})

for (const scenario of ['build-failure', 'catalog-build-failure', 'empty-build', 'sam-failure', 'sam-cancelled']) {
  test(`${scenario} prevents every content upload`, async () => {
    const result = await invoke('all', scenario)
    assert.notEqual(result.status, 0)
    assert.equal(uploads(result.calls).length, 0)
    assert.equal(invalidations(result.calls).length, 0)
    if (!['sam-failure', 'sam-cancelled'].includes(scenario)) assert.equal(deployments(result.calls).length, 0)
    assert.match(result.stderr, /Falha|Erro/)
  })
}

for (const scenario of ['stack-missing', 'bad-output', 'template-outdated']) {
  test(`${scenario} stops individual publication without creating infrastructure`, async () => {
    const result = await invoke('presentation', scenario)
    assert.notEqual(result.status, 0)
    assert.equal(uploads(result.calls).length, 0)
    assert.equal(deployments(result.calls).length, 0)
  })
}

test('upload failure stops before HTML publication and invalidation', async () => {
  const result = await invoke('presentation', 'upload-failure')
  assert.notEqual(result.status, 0)
  assert.equal(uploads(result.calls).length, 1)
  assert.equal(uploads(result.calls)[0].index, null)
  assert.equal(invalidations(result.calls).length, 0)
})
