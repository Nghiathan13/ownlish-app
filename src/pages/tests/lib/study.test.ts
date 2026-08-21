import { describe, expect, it } from "vitest";
import { parseQuestions } from "./study";

describe("parseQuestions", () => {
  it("returns the items of a part file", () => {
    const questions = [{ id: "q1" }, { id: "q2" }];
    expect(parseQuestions(JSON.stringify({ items: questions }))).toEqual(
      questions,
    );
  });

  it("returns an empty array when items are missing", () => {
    expect(parseQuestions("{}")).toEqual([]);
    expect(parseQuestions('{"other": true}')).toEqual([]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseQuestions("not json{")).toThrow(SyntaxError);
  });
});
