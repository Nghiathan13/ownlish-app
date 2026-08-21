import { describe, expect, it } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import type { Catalog } from "../model/types";
import { loadCatalog } from "./loadCatalog";

describe("loadCatalog", () => {
  it("invokes read_catalog and parses the returned JSON", async () => {
    const catalog: Catalog = { schemaVersion: 1, tests: [], partPractice: [] };
    mockIPC((cmd) => {
      expect(cmd).toBe("read_catalog");
      return JSON.stringify(catalog);
    });
    await expect(loadCatalog()).resolves.toEqual(catalog);
  });

  it("rejects when the payload is not valid JSON", async () => {
    mockIPC(() => "not json{");
    await expect(loadCatalog()).rejects.toThrow(SyntaxError);
  });
});
