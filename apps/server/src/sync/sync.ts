export type MessageHandler = (data: any) => void;

export class WSSync {
  private ws: WebSocket;
  private handlers = new Set<MessageHandler>();

  constructor(private url: string) {
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onmessage = async (event) => {
      let data: any;

      if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
      } 
      
      else if (event.data instanceof ArrayBuffer) {
        data = event.data;
      }
      
      else if (event.data instanceof Blob) {
        const buf = await event.data.arrayBuffer();
        data = buf;
      }
      
      else {
        return;
      }

      this.handlers.forEach((cb) => cb(data));
    };
  }

  onMessage(cb: MessageHandler) {
    this.handlers.add(cb);
    return () => this.handlers.delete(cb);
  }

  sendJSON(data: any) {
    this.ws.send(JSON.stringify(data));
  }

  sendBinary(buffer: ArrayBuffer) {
    this.ws.send(buffer);
  }

  onOpen(cb: () => void) {
    this.ws.onopen = cb;
  }

  close() {
    this.ws.close();
  }
}
