import { readFileSync } from 'node:fs'

// Notes keep Slidev's live editor; slide content changes need fresh navigation state.
export function presentationContent(markdown) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '').trim()
}

export function deckReload(deckFile) {
  let previous = presentationContent(readFileSync(deckFile, 'utf8'))
  return {
    name: 'presentation:reload-slide-content',
    apply: 'serve',
    enforce: 'post',
    handleHotUpdate: {
      order: 'post',
      async handler(context) {
        if (context.file !== deckFile) return
        const next = presentationContent(await context.read())
        if (next === previous) return
        previous = next
        // Run after Slidev reparses the source; discard cached slide modules too.
        context.server.moduleGraph.invalidateAll()
        context.server.ws.send({ type: 'full-reload' })
        return []
      },
    },
  }
}
