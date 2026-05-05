import * as Y from 'yjs'
import { WebSocket, WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 1234 })

const docs = new Map<string, Y.Doc>()

function getDoc(name: string) {
  if (!docs.has(name)) {
    const doc = new Y.Doc()
    docs.set(name, doc)
  }
  return docs.get(name)!
}

wss.on('connection', (ws: WebSocket) => {
  let doc: Y.Doc | null = null

  ws.on('message', (data: Buffer) => {
    const msg = JSON.parse(data.toString())

    if (msg.type === 'join') {
      doc = getDoc(msg.doc)

      const state = Y.encodeStateAsUpdate(doc)

      ws.send(JSON.stringify({ type: 'update', update: Array.from(state) }))

      doc.on('update', (update: Uint8Array, origin: any) => {
        if (origin == ws) return
        ws.send(JSON.stringify({ type: 'update', update: Array.from(update) }))
      })
    }

    if (msg.type === 'update' && doc) {
      const update = new Uint8Array(msg.update)
      Y.applyUpdate(doc, update, ws)
    }
  })
})

console.log('WS server running on ws://localhost:1234')
