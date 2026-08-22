import { describe, expect, it } from "vitest";
import {
  groupQuestionContent,
  isOptionKey,
  optionTextsByKey,
  readItemOptions,
  readItemStem,
  readUnitQuestions,
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

describe("readUnitQuestions", () => {
  it("extracts single questions for Part 1/2 and Part 5", () => {
    expect(
      readUnitQuestions(
        {
          id: "q1",
          options: [{ key: "A", en: "Opt A" }],
        },
        0,
      ),
    ).toEqual([
      {
        label: "1.",
        stem: "",
        options: [{ key: "A", en: "Opt A" }],
      },
    ]);

    expect(
      readUnitQuestions(
        {
          id: "q101",
          question: { en: "Fill the blank ______." },
          options: [{ key: "A", en: "him" }],
        },
        54,
      ),
    ).toEqual([
      {
        label: "101.",
        stem: "Fill the blank ______.",
        options: [{ key: "A", en: "him" }],
      },
    ]);
  });

  it("extracts multiple questions for group units", () => {
    expect(
      readUnitQuestions(
        {
          id: "g32",
          questions: [
            {
              number: 32,
              question: { en: "Question 32" },
              options: [{ key: "A", en: "Choice A" }],
            },
            {
              number: 33,
              question: { en: "Question 33" },
              options: [{ key: "B", en: "Choice B" }],
            },
            {
              number: 34,
              question: { en: "Question 34" },
            },
          ],
        },
        31,
      ),
    ).toEqual([
      {
        label: "32.",
        stem: "Question 32",
        options: [{ key: "A", en: "Choice A" }],
      },
      {
        label: "33.",
        stem: "Question 33",
        options: [{ key: "B", en: "Choice B" }],
      },
      {
        label: "34.",
        stem: "Question 34",
        options: [
          { key: "A", en: "" },
          { key: "B", en: "" },
          { key: "C", en: "" },
          { key: "D", en: "" },
        ],
      },
    ]);
  });
});

describe("groupQuestionContent", () => {
  it("looks up English stems and A–D options by derived number", () => {
    expect(
      groupQuestionContent(
        {
          questions: [
            {
              number: 33,
              question: { en: "Second", vi: "Hai" },
              options: [{ key: "A", en: "Fee" }],
            },
            { number: 32, question: { en: "First" } },
            { number: 32, question: "raw" },
            { number: 32, question: { vi: "Không" } },
            {
              number: 32,
              options: [
                { key: "A", en: "Office" },
                { key: "B", en: "Clinic" },
              ],
            },
            { id: "skip" },
            { number: 34 },
            null,
            { number: 34, question: null },
            { number: 34, question: { en: "Third" } },
          ],
        },
        [32, 33, 34],
      ),
    ).toEqual([
      {
        stem: "First",
        options: [
          { key: "A", en: "Office" },
          { key: "B", en: "Clinic" },
        ],
      },
      { stem: "Second", options: [{ key: "A", en: "Fee" }] },
      { stem: "Third", options: null },
    ]);
  });

  it("returns empty content when the unit has no questions", () => {
    expect(groupQuestionContent({ options: [] }, [32, 33, 34])).toEqual([
      { stem: "", options: null },
      { stem: "", options: null },
      { stem: "", options: null },
    ]);
    expect(groupQuestionContent({ questions: "nope" }, [32])).toEqual([
      { stem: "", options: null },
    ]);
    expect(groupQuestionContent(null, [32])).toEqual([
      { stem: "", options: null },
    ]);
  });
});
