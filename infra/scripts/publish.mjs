import { copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

export function classifyArtifact(file) {
  if (file.endsWith('.html')) return 'html'
  // These are the compiler-owned directories and fingerprint formats used by
  // Slidev/Vite and EventCatalog/Astro. Public assets and JSON never qualify.
  if (/^(?:assets\/.*-|_astro\/.*\.)[A-Za-z0-9_-]{8}\.(?:js|css)$/.test(file)) return 'immutable'
  return 'mutable'
}

export async function publishSite({ site, build, destination, runAws, jsonAws }) {
  const staging = await mkdtemp(path.join(tmpdir(), `community-day-${site}-`))
  try {
    const groups = { immutable: [], mutable: [], html: [] }
    for (const file of build.files) groups[classifyArtifact(file)].push(file)
    // Prepare every group before the first remote write. Relative paths stay
    // identical to dist; sync never deletes objects from the shared bucket root.
    for (const [group, files] of Object.entries(groups)) {
      for (const file of files) {
        const target = path.join(staging, group, file)
        await mkdir(path.dirname(target), { recursive: true })
        await copyFile(path.join(build.dist, file), target)
      }
    }
    for (const [group, files] of Object.entries(groups)) {
      if (!files.length) continue
      const cache = group === 'immutable' ? 'public,max-age=31536000,immutable' : 'public,max-age=0,must-revalidate'
      runAws(`publicar ${site}: ${group}`, [
        's3', 'sync', path.join(staging, group), `s3://${destination.bucket}/`,
        '--cache-control', cache, '--no-progress', '--only-show-errors',
      ])
    }
    const response = jsonAws(`invalidar ${site}`, [
      'cloudfront', 'create-invalidation', '--distribution-id', destination.distribution, '--paths', '/*',
    ])
    const invalidationId = response.Invalidation?.Id
    if (typeof invalidationId !== 'string' || !/^[A-Z0-9]+$/.test(invalidationId)) {
      throw new Error(`${site}: AWS não retornou um ID de invalidação válido`)
    }
    runAws(`aguardar invalidação de ${site}`, [
      'cloudfront', 'wait', 'invalidation-completed', '--distribution-id', destination.distribution,
      '--id', invalidationId,
    ])
    console.log(`${site} publicado: ${destination.url}`)
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}
