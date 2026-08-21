import { describe, expect, it } from "vitest";
import {
  buildTestNavigation,
  itemQuestionNumber,
  nextIndex,
  numberLabel,
  prevIndex,
  questionNumberLabel,
} from "./test-navigation";

describe("buildTestNavigation", () => {
  it("disables both directions when there are no units or only one", () => {
    expect(buildTestNavigation(0, 0)).toEqual({
      canPrev: false,
      canNext: false,
    });
    expect(buildTestNavigation(0, 1)).toEqual({
      canPrev: false,
      canNext: false,
    });
  });

  it("enables next on the first of several units", () => {
    expect(buildTestNavigation(0, 2)).toEqual({
      canPrev: false,
      canNext: true,
    });
  });

  it("enables prev on the last of several units", () => {
    expect(buildTestNavigation(1, 2)).toEqual({
      canPrev: true,
      canNext: false,
    });
  });

  it("enables both directions in the middle", () => {
    expect(buildTestNavigation(1, 3)).toEqual({
      canPrev: true,
      canNext: true,
    });
  });
});

describe("prevIndex / nextIndex", () => {
  it("steps the cursor by one", () => {
    expect(nextIndex(0)).toBe(1);
    expect(prevIndex(1)).toBe(0);
  });
});

describe("questionNumberLabel", () => {
  it("renders a 1-based label from the cursor index", () => {
    expect(questionNumberLabel(0)).toBe("1.");
    expect(questionNumberLabel(1)).toBe("2.");
  });

  it("labels Part 5 from index 54 as 101", () => {
    expect(itemQuestionNumber(54)).toBe(101);
    expect(questionNumberLabel(54)).toBe("101.");
    expect(questionNumberLabel(55)).toBe("102.");
  });
});

describe("numberLabel", () => {
  it("renders a TOEIC question number", () => {
    expect(numberLabel(32)).toBe("32.");
  });
});
