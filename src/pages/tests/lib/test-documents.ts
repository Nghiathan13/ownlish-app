export const DOCUMENT_SLOT_COUNT = 3;

export interface GroupDocument {
  kind: string;
  content: string;
}

function contentEn(value: unknown): string {
  if (
    typeof value !== "object" ||
    value === null ||
    !("en" in value) ||
    typeof value.en !== "string"
  ) {
    return "";
  }
  return value.en;
}

export function groupKind(unit: unknown): string {
  if (
    typeof unit !== "object" ||
    unit === null ||
    !("kind" in unit) ||
    typeof unit.kind !== "string"
  ) {
    return "";
  }
  return unit.kind;
}

/** Join `transcript.en[].text` for the current group unit. */
export function groupTranscriptEn(unit: unknown): string {
  if (
    typeof unit !== "object" ||
    unit === null ||
    !("transcript" in unit) ||
    typeof unit.transcript !== "object" ||
    unit.transcript === null ||
    !("en" in unit.transcript) ||
    !Array.isArray(unit.transcript.en)
  ) {
    return "";
  }

  const parts: string[] = [];
  for (const entry of unit.transcript.en) {
    if (typeof entry !== "object" || entry === null) continue;
    if (!("text" in entry) || typeof entry.text !== "string") continue;
    parts.push(entry.text);
  }
  return parts.join("");
}

/** Part 6 passage (`content.en`) or Part 3/4 transcript. */
export function groupHeaderEn(unit: unknown): string {
  if (
    typeof unit === "object" &&
    unit !== null &&
    "content" in unit &&
    typeof unit.content === "object" &&
    unit.content !== null &&
    "en" in unit.content &&
    typeof unit.content.en === "string"
  ) {
    return unit.content.en;
  }
  return groupTranscriptEn(unit);
}

/** P7 `documents[]`, else P6 kind+content or P3/P4 transcript. */
export function readUnitDocuments(unit: unknown): GroupDocument[] {
  if (typeof unit !== "object" || unit === null) return [];
  if ("documents" in unit && Array.isArray(unit.documents)) {
    const documents: GroupDocument[] = [];
    for (const entry of unit.documents) {
      if (typeof entry !== "object" || entry === null) continue;
      const kind =
        "kind" in entry && typeof entry.kind === "string" ? entry.kind : "";
      const content =
        "content" in entry ? contentEn(entry.content) : "";
      if (kind === "" && content === "") continue;
      documents.push({ kind, content });
    }
    return documents;
  }
  const kind = groupKind(unit);
  const content = groupHeaderEn(unit);
  return kind === "" && content === "" ? [] : [{ kind, content }];
}

