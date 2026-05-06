// 하나의 문서에 대한 정보 코드

import * as Y from "yjs";

export type YDocument = {
  docId: string,
  ydoc: Y.Doc,
  ytext: Y.Text,
  ymeta: Y.Map<any>;
}

export function createYDocument(docId: string): YDocument {
  const ydoc = new Y.Doc();

  const ytext = ydoc.getText("content");
  const ymeta = ydoc.getMap("meta");

  if (!ymeta.has("title")) {
    ymeta.set("title", "Untitled");
    ymeta.set("createdAt", new Date().toISOString());
  }

  return {
    docId,
    ydoc,
    ytext,
    ymeta
  };
}

export function getText(doc: YDocument): string {
  return doc.ytext.toString();
}

// 전체 text를 교체하는 함수. 전체 교체가 많지는 않을 듯
export function setText(doc: YDocument, text: string) {
  doc.ydoc.transact(() => {
    doc.ytext.delete(0, doc.ytext.length);
    doc.ytext.insert(0, text);
  });
}

// 부분 업데이트
export function insertText(doc: YDocument, index: number, text: string) {
  doc.ytext.insert(index, text);
}

export function deleteText(doc: YDocument, index: number, length: number) {
  doc.ytext.delete(index, length);
}

export function observeText(doc: YDocument, cb: () => void) {
  doc.ytext.observe(cb)
  return () => doc.ytext.unobserve(cb);
}

export function getMeta<T>(doc: YDocument, key: string): T | undefined {
  return doc.ymeta.get(key);
}
