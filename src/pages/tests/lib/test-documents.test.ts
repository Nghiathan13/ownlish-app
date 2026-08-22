import { describe, expect, it } from "vitest";
import {
  groupHeaderEn,
  groupKind,
  groupTranscriptEn,
  readUnitDocuments,
} from "./test-documents";

describe("readUnitDocuments", () => {
  it("maps Part 7 documents kind and content.en", () => {
    expect(
      readUnitDocuments({
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
      readUnitDocuments({
        kind: "announcement",
        content: { en: "Come to the workshop." },
      }),
    ).toEqual([{ kind: "announcement", content: "Come to the workshop." }]);
    expect(
      readUnitDocuments({
        transcript: { en: [{ text: "Thanks for calling." }] },
      }),
    ).toEqual([{ kind: "", content: "Thanks for calling." }]);
    expect(readUnitDocuments(null)).toEqual([]);
    expect(readUnitDocuments({ documents: "nope" })).toEqual([]);
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

