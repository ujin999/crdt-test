import * as Y from 'yjs'
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ 
  port: 1234,
  host: '0.0.0.0'
})

const docs = new Map<string, Y.Doc>()

function getDoc(name: string) {
  if (!docs.has(name)) {
    docs.set(name, new Y.Doc())
  }
  return docs.get(name)!
}

wss.on('connection', (ws) => {
  let doc: Y.Doc

  ws.on('message', (message: Buffer) => {
    const msg = JSON.parse(message.toString())

    // 방 입장
    if (msg.type === 'join') {
      doc = getDoc(msg.doc)

      // 초기 상태 전송
      const state = Y.encodeStateAsUpdate(doc)
      ws.send(JSON.stringify({
        type: 'sync',
        update: Array.from(state)
      }))
      
      // 다른 사용자 변경 전달
      doc.on('update', (update: Uint8Array, origin: any) => {
        if (origin === ws) return

        ws.send(JSON.stringify({
          type: 'update',
          update: Array.from(update)
        }))
      })
    }

    // 클라이언트 업데이트 반영
    if (msg.type === 'update') {
        const update = new Uint8Array(msg.update)
        Y.applyUpdate(doc, update, ws)
    }
  })
})

console.log('WebSocket server running on ws://localhost:1234')
