interface PartFileShape {
  items?: unknown[];
}

/** Parse a part file and return its questions ([] when items are missing).
 *  Throws on invalid JSON — callers handle the error state. */
export function parseQuestions(partContent: string): unknown[] {
  const part = JSON.parse(partContent) as PartFileShape;
  return part.items ?? [];
}
