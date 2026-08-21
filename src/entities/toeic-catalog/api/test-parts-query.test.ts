import { beforeEach, describe, expect, it } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import { QueryClient } from "@tanstack/query-core";
import { queryClient as appQueryClient } from "@/shared/api";
import type { CatalogTest } from "../model/types";
import { fetchTestParts, partsQueryKey } from "./test-parts-query";

const test: CatalogTest = {
  id: "ets19-t01",
  year: 2019,
  testNumber: 1,
  parts: [
    { number: 1, path: "content/toeic/ets19-t01/part_1.json", questionCount: 6 },
    { number: 2, path: "content/toeic/ets19-t01/part_2.json", questionCount: 25 },
  ],
};

const files = [
  { path: "content/toeic/ets19-t01/part_1.json", content: "{}" },
  { path: "content/toeic/ets19-t01/part_2.json", content: "{}" },
];

let queryClient: QueryClient;
let invokeCount = 0;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, gcTime: 5 * 60 * 1000, retry: false },
    },
  });
  invokeCount = 0;
  mockIPC((cmd) => {
    if (cmd === "read_content_files") {
      invokeCount += 1;
      return files;
    }
    return undefined;
  });
});

describe("fetchTestParts", () => {
  it("fetches and caches on a miss", async () => {
    const result = await fetchTestParts(queryClient, test);
    expect(result).toEqual(files);
    expect(invokeCount).toBe(1);
  });

  it("serves fresh data from cache without re-reading", async () => {
    await fetchTestParts(queryClient, test);
    await fetchTestParts(queryClient, test);
    expect(invokeCount).toBe(1);
  });

  it("re-reads after the cache is cleared", async () => {
    await fetchTestParts(queryClient, test);
    queryClient.clear();
    await fetchTestParts(queryClient, test);
    expect(invokeCount).toBe(2);
  });
});

describe("partsQueryKey", () => {
  it("scopes keys by test id", () => {
    expect(partsQueryKey("ets19-t01")).toEqual(["test-parts", "ets19-t01"]);
  });
});

describe("app query client defaults", () => {
  it("configures a short-lived cache (5 min stale + gc, no retry)", () => {
    const queries = appQueryClient.getDefaultOptions().queries ?? {};
    expect(queries.staleTime).toBe(5 * 60 * 1000);
    expect(queries.gcTime).toBe(5 * 60 * 1000);
    expect(queries.retry).toBe(false);
  });
});
