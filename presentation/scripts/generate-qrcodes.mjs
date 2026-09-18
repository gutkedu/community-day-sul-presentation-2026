import { mkdir, readFile, writeFile } from 'node:fs/promises'
import QRCode from 'qrcode'

const links = JSON.parse(await readFile(new URL('../lib/published-links.json', import.meta.url), 'utf8'))
const output = new URL('../public/qrcodes/', import.meta.url)
await mkdir(output, { recursive: true })
for (const link of links) {
  if (!/^[a-z0-9-]+$/.test(link.id) || new URL(link.url).protocol !== 'https:') {
    throw new Error('QR codes require safe IDs and HTTPS URLs')
  }
  const svg = await QRCode.toString(link.url, {
    type: 'svg', margin: 4, errorCorrectionLevel: 'M',
    color: { dark: '#000000ff', light: '#ffffffff' },
  })
  await writeFile(new URL(`${link.id}.svg`, output), svg)
  console.log(`QR code: ${link.label} → ${link.url}`)
}
