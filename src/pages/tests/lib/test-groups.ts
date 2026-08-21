import { readItemOptions, type ItemOption } from "./test-options";

/** Flattened unit index of the first Part 3 group (6 Part 1 + 25 Part 2). */
export const GROUP_START_INDEX = 31;
export const GROUP_QUESTION_COUNT = 3;
/** First Part 6 group — last P5 item is index 83 (question 130). */
export const PART6_START_INDEX = 84;
export const PART6_QUESTION_COUNT = 4;
export const PART6_ORIGIN = 130;
/** First Part 7 group — last P6 group is index 87. */
export const PART7_START_INDEX = 88;
export const DOCUMENT_SLOT_COUNT = 3;
export const QUESTION_SLOT_COUNT = 5;

export interface GroupDocument {
  kind: string;
  content: string;
}

export interface GroupQuestionContent {
  stem: string;
  options: ItemOption[] | null;
}

export function isGroupUnit(unit: unknown): boolean {
  return (
    typeof unit === "object" &&
    unit !== null &&
    "questions" in unit &&
    Array.isArray(unit.questions)
  );
}

/** P3/P4: 31 + (index - 31) * 3 + 1, +2, +3.
 *  P6: 130 + (index - 84) * 4 + 1, +2, +3, +4.
 *  P7 (88–102): question `number`s on the current cluster. */
export function groupQuestionNumbers(
  index: number,
  unit?: unknown,
): number[] {
  if (index >= PART7_START_INDEX) {
    return groupQuestionNumbersFromUnit(unit);
  }
  if (index >= PART6_START_INDEX) {
    const offset = (index - PART6_START_INDEX) * PART6_QUESTION_COUNT;
    return [1, 2, 3, 4].map((step) => PART6_ORIGIN + offset + step);
  }
  const offset = (index - GROUP_START_INDEX) * GROUP_QUESTION_COUNT;
  return [1, 2, 3].map((step) => GROUP_START_INDEX + offset + step);
}

export function groupQuestionNumbersFromUnit(unit: unknown): number[] {
  if (
    typeof unit !== "object" ||
    unit === null ||
    !("questions" in unit) ||
    !Array.isArray(unit.questions)
  ) {
    return [];
  }
  const numbers = new Set<number>();
  for (const entry of unit.questions) {
    if (typeof entry !== "object" || entry === null) continue;
    if (!("number" in entry) || typeof entry.number !== "number") continue;
    numbers.add(entry.number);
  }
  return [...numbers].sort((left, right) => left - right);
}

/** Look up `question.en` and A–D options for each derived number. */
export function groupQuestionContent(
  unit: unknown,
  numbers: readonly number[],
): GroupQuestionContent[] {
  const byNumber = new Map<number, GroupQuestionContent>();
  if (
    typeof unit === "object" &&
    unit !== null &&
    "questions" in unit &&
    Array.isArray(unit.questions)
  ) {
    for (const entry of unit.questions) {
      if (typeof entry !== "object" || entry === null) continue;
      if (!("number" in entry) || typeof entry.number !== "number") continue;
      const current = byNumber.get(entry.number) ?? {
        stem: "",
        options: null,
      };
      if (
        "question" in entry &&
        typeof entry.question === "object" &&
        entry.question !== null &&
        "en" in entry.question &&
        typeof entry.question.en === "string"
      ) {
        current.stem = entry.question.en;
      }
      const options = readItemOptions(entry);
      if (options) current.options = options;
      byNumber.set(entry.number, current);
    }
  }
  return numbers.map(
    (number) => byNumber.get(number) ?? { stem: "", options: null },
  );
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

/** P7 `documents[]`, else P6 kind+content or P3/P4 transcript. */
export function groupDocuments(unit: unknown): GroupDocument[] {
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
