import { describe, expect, it } from "vitest";
import {
  groupDocuments,
  groupHeaderEn,
  groupKind,
  groupQuestionContent,
  groupQuestionNumbers,
  groupTranscriptEn,
  isGroupUnit,
} from "./test-groups";

describe("isGroupUnit", () => {
  it("detects a questions array and rejects items", () => {
    expect(isGroupUnit({ questions: [] })).toBe(true);
    expect(isGroupUnit({ questions: [{ id: "q1" }] })).toBe(true);
    expect(isGroupUnit(null)).toBe(false);
    expect(isGroupUnit({ options: [] })).toBe(false);
    expect(isGroupUnit({ questions: "nope" })).toBe(false);
  });
});

describe("groupQuestionNumbers", () => {
  it("maps group index 31 to 32–34 and 32 to 35–37", () => {
    expect(groupQuestionNumbers(31)).toEqual([32, 33, 34]);
    expect(groupQuestionNumbers(32)).toEqual([35, 36, 37]);
  });

  it("maps Part 6 index 84 to 131–134 and 85 to 135–138", () => {
    expect(groupQuestionNumbers(84)).toEqual([131, 132, 133, 134]);
    expect(groupQuestionNumbers(85)).toEqual([135, 136, 137, 138]);
  });

  it("reads Part 7 numbers from the cluster instead of a 3/4 formula", () => {
    expect(groupQuestionNumbers(88)).toEqual([]);
    expect(
      groupQuestionNumbers(88, {
        questions: [{ number: 148 }, { id: "skip" }, null, { number: 147 }],
      }),
    ).toEqual([147, 148]);
    expect(groupQuestionNumbers(102, { questions: "nope" })).toEqual([]);
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

describe("groupDocuments", () => {
  it("maps Part 7 documents kind and content.en", () => {
    expect(
      groupDocuments({
        documents: [
          { kind: "press_release", content: { en: "First", vi: "Một" } },
          null,
          { kind: 1, content: { vi: "Không" } },
          { kind: "review", content: { en: "Second" } },
          { kind: "email" },
        ],
      }),
    ).toEqual([
      { kind: "press_release", content: "First" },
      { kind: "review", content: "Second" },
      { kind: "email", content: "" },
    ]);
  });

  it("falls back to group-level kind and passage/transcript", () => {
    expect(
      groupDocuments({
        kind: "announcement",
        content: { en: "Come to the workshop." },
      }),
    ).toEqual([{ kind: "announcement", content: "Come to the workshop." }]);
    expect(
      groupDocuments({
        transcript: { en: [{ text: "Thanks for calling." }] },
      }),
    ).toEqual([{ kind: "", content: "Thanks for calling." }]);
    expect(groupDocuments(null)).toEqual([]);
    expect(groupDocuments({ documents: "nope" })).toEqual([]);
  });
});

describe("groupKind", () => {
  it("reads the Part 6 document kind", () => {
    expect(groupKind({ kind: "announcement" })).toBe("announcement");
    expect(groupKind({ kind: "letter" })).toBe("letter");
    expect(groupKind(null)).toBe("");
    expect(groupKind({ questions: [] })).toBe("");
    expect(groupKind({ kind: 1 })).toBe("");
  });
});

describe("groupHeaderEn", () => {
  it("prefers content.en for Part 6 passages", () => {
    expect(
      groupHeaderEn({
        content: { en: "Come to the Maxley Heights Center. ___131___ ." },
        transcript: { en: [{ text: "ignored" }] },
      }),
    ).toBe("Come to the Maxley Heights Center. ___131___ .");
  });

  it("falls back to the English transcript", () => {
    expect(
      groupHeaderEn({
        transcript: { en: [{ text: "Thanks for calling." }] },
      }),
    ).toBe("Thanks for calling.");
    expect(groupHeaderEn({ content: null })).toBe("");
    expect(groupHeaderEn({ content: "raw" })).toBe("");
    expect(groupHeaderEn({ content: { vi: "Không" } })).toBe("");
    expect(groupHeaderEn({ content: { en: 1 } })).toBe("");
  });
});

describe("groupTranscriptEn", () => {
  it("joins English transcript segments for the current group", () => {
    expect(
      groupTranscriptEn({
        questions: [],
        transcript: {
          en: [
            { text: "Hello. ", questionIds: [] },
            null,
            { text: "How can I help?" },
            { questionIds: [] },
            { text: 1 },
          ],
        },
      }),
    ).toBe("Hello. How can I help?");
  });

  it("returns empty when transcript.en is missing", () => {
    expect(groupTranscriptEn(null)).toBe("");
    expect(groupTranscriptEn({ questions: [] })).toBe("");
    expect(groupTranscriptEn({ transcript: null })).toBe("");
    expect(groupTranscriptEn({ transcript: "raw" })).toBe("");
    expect(groupTranscriptEn({ transcript: {} })).toBe("");
    expect(groupTranscriptEn({ transcript: { en: "raw" } })).toBe("");
  });
});
