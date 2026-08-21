export const OPTION_KEYS = ["A", "B", "C", "D"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

export interface ItemOption {
  key: string;
  en: string;
}

export const EMPTY_OPTIONS: ItemOption[] = OPTION_KEYS.map((key) => ({
  key,
  en: "",
}));

export function isOptionKey(key: string): key is OptionKey {
  return key === "A" || key === "B" || key === "C" || key === "D";
}

/** Read A–D English option lines from an item unit. Groups and malformed
 *  units return null so the study page can clear the four slots. */
export function readItemOptions(unit: unknown): ItemOption[] | null {
  if (typeof unit !== "object" || unit === null || !("options" in unit)) {
    return null;
  }
  if (!Array.isArray(unit.options)) {
    return null;
  }

  const options: ItemOption[] = [];
  for (const entry of unit.options) {
    if (typeof entry !== "object" || entry === null) continue;
    if (!("key" in entry) || !("en" in entry)) continue;
    if (typeof entry.key !== "string" || typeof entry.en !== "string") continue;
    options.push({ key: entry.key, en: entry.en });
  }
  return options.length === 0 ? null : options;
}

/** Read `question.en` from an item unit (Part 2 / Part 5). */
export function readItemStem(unit: unknown): string {
  if (typeof unit !== "object" || unit === null) return "";
  if (!("question" in unit) || typeof unit.question !== "object") return "";
  if (unit.question === null) return "";
  if (!("en" in unit.question) || typeof unit.question.en !== "string") {
    return "";
  }
  return unit.question.en;
}

/** Map item options onto the four A–D slots. Missing/unknown keys stay "". */
export function optionTextsByKey(
  options: readonly ItemOption[] | null,
): Record<OptionKey, string> {
  const byKey: Record<OptionKey, string> = { A: "", B: "", C: "", D: "" };
  if (options) {
    for (const option of options) {
      if (isOptionKey(option.key)) byKey[option.key] = option.en;
    }
  }
  return byKey;
}
