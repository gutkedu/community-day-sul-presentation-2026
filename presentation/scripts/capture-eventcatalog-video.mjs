import { once } from 'node:events'
import { readdir, rename, rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright-chromium'

const FRAME_RATE = 25
const FRAME_COUNT = 75
const SETTLE_TIME_MS = 5000

const catalogUrl = process.argv[2]

if (!catalogUrl) {
  throw new Error('Uso: node scripts/capture-eventcatalog-video.mjs <url-do-visualizador>')
}

const output = resolve('public/screenshots/eventcatalog-service-map.webm')
const temporaryOutput = `${output}.tmp`
const poster = resolve('public/screenshots/eventcatalog-service-map.png')

const playwrightCache = join(homedir(), 'Library', 'Caches', 'ms-playwright')
const ffmpegDirectories = (await readdir(playwrightCache, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('ffmpeg-'))
  .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }))

const ffmpegDirectory = ffmpegDirectories.at(-1)
if (!ffmpegDirectory) throw new Error('FFmpeg do Playwright não encontrado.')

const ffmpeg = join(playwrightCache, ffmpegDirectory.name, 'ffmpeg-mac')
await rm(temporaryOutput, { force: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1584, height: 1000 },
  colorScheme: 'dark',
})

await page.setContent(`
  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: #111821;
    }

    iframe {
      width: 1920px;
      height: 1080px;
      border: 0;
      transform: translate(-327px, -68px);
      transform-origin: top left;
    }
  </style>
  <iframe src="${catalogUrl}" title="EventCatalog visualizer"></iframe>
`)

await page.waitForTimeout(SETTLE_TIME_MS)
await page.screenshot({ path: poster })

const encoder = spawn(ffmpeg, [
  '-y',
  '-f', 'image2pipe',
  '-framerate', String(FRAME_RATE),
  '-vcodec', 'mjpeg',
  '-i', 'pipe:0',
  '-an',
  '-c:v', 'libvpx',
  '-b:v', '8M',
  '-crf', '4',
  '-deadline', 'good',
  '-cpu-used', '1',
  '-pix_fmt', 'yuv420p',
  '-f', 'webm',
  temporaryOutput,
], { stdio: ['pipe', 'ignore', 'pipe'] })

let encoderLog = ''
encoder.stderr.setEncoding('utf8')
encoder.stderr.on('data', (chunk) => { encoderLog += chunk })

const startedAt = Date.now()
for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
  const image = await page.screenshot({ type: 'jpeg', quality: 100 })
  if (!encoder.stdin.write(image)) await once(encoder.stdin, 'drain')

  const nextFrameAt = startedAt + ((frame + 1) * 1000) / FRAME_RATE
  await page.waitForTimeout(Math.max(0, nextFrameAt - Date.now()))
}

encoder.stdin.end()
const [exitCode] = await once(encoder, 'close')
await browser.close()

if (exitCode !== 0) {
  await rm(temporaryOutput, { force: true })
  throw new Error(`Falha ao codificar o vídeo:\n${encoderLog}`)
}

await rename(temporaryOutput, output)

console.log(`Vídeo salvo em ${output}`)
console.log(`Poster salvo em ${poster}`)
