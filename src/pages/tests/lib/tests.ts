import type { CatalogTest } from "@/entities/toeic-catalog";

export interface TestCardViewModel {
  id: string;
  year: number;
  testNumber: number;
  seriesLabel: string;
  complete: boolean;
}

export function buildTestCardViewModel(test: CatalogTest): TestCardViewModel {
  return {
    id: test.id,
    year: test.year,
    testNumber: test.testNumber,
    seriesLabel: test.id.startsWith("ybm") ? "YBM" : "ETS",
    complete: test.parts.length === 7,
  };
}
