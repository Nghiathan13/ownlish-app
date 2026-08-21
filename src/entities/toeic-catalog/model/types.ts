export interface CatalogMedia {
  audio?: string;
  image?: string;
}

export interface CatalogPart {
  number: number;
  path: string;
  questionCount: number;
}

export interface CatalogTest {
  id: string;
  year: number;
  testNumber: number;
  parts: CatalogPart[];
}

export interface CatalogPartPractice {
  number: number;
  path: string;
  questionCount: number;
  complete: boolean;
}

export interface Catalog {
  schemaVersion: number;
  tests: CatalogTest[];
  partPractice: CatalogPartPractice[];
  mediaByGroupId: Record<string, CatalogMedia>;
}
