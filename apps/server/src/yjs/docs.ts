import { createYDocument, YDocument } from "./doc";

const documents = new Map<string, YDocument>();
let currentDocId: string | null = null;

export function getOrCreateDocument(docId: string): YDocument {
  if (!documents.has(docId)) {
    const newDoc = createYDocument(docId);
    documents.set(docId, newDoc);
  }

  return documents.get(docId)!;
}

export function setCurrentDocument(docId: string): YDocument {
  const doc = getOrCreateDocument(docId);
  currentDocId = docId;
  return doc;
}

export function getCurrentDocument(): YDocument | null {
  if (!currentDocId) return null;
  return documents.get(currentDocId) || null;
}

export function getAllDocuments(): YDocument[] {
  return Array.from(documents.values());
}

export function removeDocument(docId: string) {
  const doc = documents.get(docId);

  if (doc) {
    doc.ydoc.destroy();
    documents.delete(docId);
  }

  if (currentDocId === docId) {
    currentDocId = null;
  }
}
