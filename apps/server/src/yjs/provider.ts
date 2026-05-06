import * as Y from 'yjs';
import type { YDocument } from './doc';
import { WSSync } from '../sync/sync';
import type { AwarenessManager, AwarenessState } from './awareness';

export type WSProvider = {
  destroy: () => void;
}

const WS_URL = 'ws://localhost:1234';

export function createWSProvider(
  doc: YDocument,
  awareness: AwarenessManager
): WSProvider {
  const sync = new WSSync(WS_URL);

  sync.onOpen(() => {
    // room join
    sync.sendJSON({
      type: "join",
      doc: doc.docId,
    });

    // 초기 awareness
    sync.sendJSON({
      type: "awareness",
      payload: awareness.local,
    });
  });

  const handleUpdate = (update: Uint8Array, origin: any) => {
    if (origin === "remote") return;

    const buffer = update.buffer.slice(
      update.byteOffset,
      update.byteOffset + update.byteLength
    );

    sync.sendBinary(buffer as ArrayBuffer);
  };

  doc.ydoc.on("update", handleUpdate);

  const offMessage = sync.onMessage((data) => {

    // binary → Yjs
    if (data instanceof ArrayBuffer) {
      Y.applyUpdate(doc.ydoc, new Uint8Array(data), "remote");
      return;
    }

    // JSON 처리
    if (data.type === "awareness") {
      awareness.states.set(data.clientId, data.payload);
      awareness.emitChange();
    }

    if (data.type === "sync-awareness") {
      awareness.replaceAll(data.payload);
    }

    if (data.type === "awareness-remove") {
      awareness.states.delete(data.clientId);
      awareness.emitChange();
    }
  });

  // awareness -> server
  const offAwareness = awareness.onChange(() => {
    sync.sendJSON({
      type: "awareness",
      payload: awareness.local,
    });
  });

  // terminate
  const destroy = () => {
    doc.ydoc.off("update", handleUpdate);
    offMessage();
    offAwareness();
    sync.close();
  };

  return { destroy };
}
