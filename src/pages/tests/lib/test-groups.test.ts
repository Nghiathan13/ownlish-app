import { describe, expect, it } from "vitest";
import {
  groupQuestionNumbers,
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
