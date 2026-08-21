import { describe, expect, it } from "vitest";
import { parseUnits } from "./study";

describe("parseUnits", () => {
  it("returns items when the part has items", () => {
    const units = [{ id: "q1" }, { id: "q2" }];
    expect(parseUnits(JSON.stringify({ items: units }))).toEqual(units);
  });

  it("returns groups as units when the part has groups (group = 1 unit)", () => {
    const groups = [{ id: "g1", questions: [] }, { id: "g2", questions: [] }];
    expect(parseUnits(JSON.stringify({ groups }))).toEqual(groups);
  });

  it("returns an empty array when neither items nor groups exist", () => {
    expect(parseUnits("{}")).toEqual([]);
    expect(parseUnits('{"other": true}')).toEqual([]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseUnits("not json{")).toThrow(SyntaxError);
  });
});
