/** Flattened unit index of the first Part 3 group (6 Part 1 + 25 Part 2). */
export const GROUP_START_INDEX = 31;
export const GROUP_QUESTION_COUNT = 3;
/** First Part 6 group — last P5 item is index 83 (question 130). */
export const PART6_START_INDEX = 84;
export const PART6_QUESTION_COUNT = 4;
export const PART6_ORIGIN = 130;
/** First Part 7 group — last P6 group is index 87. */
export const PART7_START_INDEX = 88;
export const QUESTION_SLOT_COUNT = 5;

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
