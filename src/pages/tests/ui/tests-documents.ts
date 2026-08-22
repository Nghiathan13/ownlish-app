import "./tests-documents.css";
import {
  DOCUMENT_SLOT_COUNT,
  type GroupDocument,
} from "../lib/test-documents";

export interface DocumentSlot {
  element: HTMLElement;
  setDocument: (document: GroupDocument | null) => void;
}

function renderDocumentSlot(): DocumentSlot {
  const element = document.createElement("div");
  element.className = "test__document";
  element.hidden = true;

  const kind = document.createElement("p");
  kind.className = "test__kind";
  kind.hidden = true;

  const content = document.createElement("p");
  content.className = "test__transcript";
  content.hidden = true;

  element.append(kind, content);

  return {
    element,
    setDocument(document) {
      if (!document || (document.kind === "" && document.content === "")) {
        element.hidden = true;
        kind.textContent = "";
        kind.hidden = true;
        content.textContent = "";
        content.hidden = true;
        return;
      }
      element.hidden = false;
      kind.textContent = document.kind;
      kind.hidden = document.kind === "";
      content.textContent = document.content;
      content.hidden = document.content === "";
    },
  };
}

export interface TestsDocuments {
  elements: HTMLElement[];
  setDocuments: (documents: readonly GroupDocument[]) => void;
}

/** Pre-rendered document slots. `setDocuments` writes kind and text
 *  into cached slots — no DOM query or node create on navigation. */
export function renderTestsDocuments(): TestsDocuments {
  const slots = Array.from(
    { length: DOCUMENT_SLOT_COUNT },
    renderDocumentSlot,
  );

  return {
    elements: slots.map((slot) => slot.element),
    setDocuments(documents) {
      for (let i = 0; i < slots.length; i += 1) {
        const document = documents[i] ?? null;
        slots[i].setDocument(document);
      }
    },
  };
}

