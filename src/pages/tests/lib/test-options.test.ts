import { describe, expect, it } from "vitest";
import {
  isOptionKey,
  optionTextsByKey,
  readItemOptions,
  readItemStem,
} from "./test-options";

describe("isOptionKey", () => {
  it("accepts A–D and rejects other keys", () => {
    expect(isOptionKey("A")).toBe(true);
    expect(isOptionKey("B")).toBe(true);
    expect(isOptionKey("C")).toBe(true);
    expect(isOptionKey("D")).toBe(true);
    expect(isOptionKey("E")).toBe(false);
    expect(isOptionKey("a")).toBe(false);
  });
});

describe("readItemOptions", () => {
  it("reads English option lines from an item", () => {
    expect(
      readItemOptions({
        options: [
          { key: "A", en: "One", vi: "Một" },
          { key: "B", en: "Two" },
        ],
      }),
    ).toEqual([
      { key: "A", en: "One" },
      { key: "B", en: "Two" },
    ]);
  });

  it("returns null for groups, missing options, and empty/malformed entries", () => {
    expect(readItemOptions(null)).toBeNull();
    expect(readItemOptions({ id: "q1" })).toBeNull();
    expect(readItemOptions({ options: "A" })).toBeNull();
    expect(readItemOptions({ questions: [] })).toBeNull();
    expect(readItemOptions({ options: [] })).toBeNull();
    expect(
      readItemOptions({
        options: [null, { key: 1, en: "x" }, { key: "A" }, { en: "x" }],
      }),
    ).toBeNull();
    expect(
      readItemOptions({ options: [null, { key: "A", en: "One" }] }),
    ).toEqual([{ key: "A", en: "One" }]);
  });
});

describe("readItemStem", () => {
  it("reads question.en from an item", () => {
    expect(
      readItemStem({
        question: { en: "Ms. Durkin asked for volunteers.", vi: "..." },
      }),
    ).toBe("Ms. Durkin asked for volunteers.");
  });

  it("returns empty when the stem is missing", () => {
    expect(readItemStem(null)).toBe("");
    expect(readItemStem({ id: "q1" })).toBe("");
    expect(readItemStem({ question: null })).toBe("");
    expect(readItemStem({ question: "raw" })).toBe("");
    expect(readItemStem({ question: { vi: "Không" } })).toBe("");
  });
});

describe("optionTextsByKey", () => {
  it("fills A–D by key and clears missing slots", () => {
    expect(
      optionTextsByKey([
        { key: "D", en: "Flowers" },
        { key: "A", en: "Handbag" },
        { key: "E", en: "Skip" },
      ]),
    ).toEqual({ A: "Handbag", B: "", C: "", D: "Flowers" });
    expect(optionTextsByKey(null)).toEqual({ A: "", B: "", C: "", D: "" });
  });
});
