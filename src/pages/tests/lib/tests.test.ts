import { describe, expect, it } from "vitest";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { buildTestCardViewModel } from "./tests";

function makeTest(overrides: Partial<CatalogTest> = {}): CatalogTest {
  return {
    id: "ets19-t01",
    year: 2019,
    testNumber: 1,
    parts: Array.from({ length: 7 }, (_, i) => ({
      number: i + 1,
      path: `content/toeic/ets19-t01/part_${i + 1}.json`,
      questionCount: 10,
    })),
    ...overrides,
  };
}

describe("buildTestCardViewModel", () => {
  it("maps an ETS test and marks 7 parts as complete", () => {
    expect(buildTestCardViewModel(makeTest())).toEqual({
      id: "ets19-t01",
      year: 2019,
      testNumber: 1,
      seriesLabel: "ETS",
      complete: true,
    });
  });

  it("labels ybm tests as YBM", () => {
    const model = buildTestCardViewModel(makeTest({ id: "ybm26-t03" }));
    expect(model.seriesLabel).toBe("YBM");
  });

  it("marks a test incomplete when parts are missing", () => {
    const model = buildTestCardViewModel(
      makeTest({ parts: makeTest().parts.slice(0, 5) }),
    );
    expect(model.complete).toBe(false);
  });
});
