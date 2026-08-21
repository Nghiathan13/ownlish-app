import type { QueryClient } from "@tanstack/query-core";
import type { CatalogTest } from "../model/types";
import { loadTestParts } from "./loadTestParts";

// query key factory for the 7 part files of a test
export const TEST_PARTS_KEY = ["test-parts"] as const;

export function partsQueryKey(testId: string): readonly string[] {
  return [...TEST_PARTS_KEY, testId];
}

// fetch through the query cache: fresh data (staleTime) is returned without
// re-reading the files; expired/absent entries re-read and re-cache
export async function fetchTestParts(
  queryClient: QueryClient,
  test: CatalogTest,
): Promise<Awaited<ReturnType<typeof loadTestParts>>> {
  return queryClient.fetchQuery({
    queryKey: partsQueryKey(test.id),
    queryFn: () => loadTestParts(test),
  });
}
