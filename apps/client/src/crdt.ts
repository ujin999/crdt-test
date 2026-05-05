import * as Y from 'yjs'

export const doc = new Y.Doc()
const ws = new WebSocket('ws://172.16.11.12:1234')

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'join',
    doc: 'room1'
  }))
}

// 서버 -> 클라이언트
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  if (msg.type === 'sync' || msg.type === 'update') {
    const update = new Uint8Array(msg.update)
    Y.applyUpdate(doc, update)
  }
}

// 로컬 -> 서버
doc.on('update', (update) => {
  ws.send(JSON.stringify({
    type: 'update',
    update: Array.from(update)
  }))
})