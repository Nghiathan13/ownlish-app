export interface TestNavigation {
  canPrev: boolean;
  canNext: boolean;
}

export function buildTestNavigation(
  index: number,
  length: number,
): TestNavigation {
  return {
    canPrev: index > 0,
    canNext: index < length - 1,
  };
}

export function prevIndex(index: number): number {
  return index - 1;
}

export function nextIndex(index: number): number {
  return index + 1;
}

export function numberLabel(value: number): string {
  return `${value}.`;
}

/** Flattened unit index of the first Part 5 item (after P3/P4 groups). */
export const PART5_START_INDEX = 54;
/** index 54 → 101, i.e. number = index + 47. */
export const PART5_NUMBER_OFFSET = 47;

export function itemQuestionNumber(index: number): number {
  return index >= PART5_START_INDEX
    ? index + PART5_NUMBER_OFFSET
    : index + 1;
}

export function questionNumberLabel(index: number): string {
  return numberLabel(itemQuestionNumber(index));
}
