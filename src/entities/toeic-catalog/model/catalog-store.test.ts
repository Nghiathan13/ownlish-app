import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadCatalog } from "../api/loadCatalog";
import { catalogStore } from "./catalog-store";
import type { Catalog } from "./types";

vi.mock("../api/loadCatalog", () => ({
  loadCatalog: vi.fn(),
}));

const mockLoad = vi.mocked(loadCatalog);

const catalog: Catalog = {
  schemaVersion: 1,
  tests: [{ id: "ets19-t01", year: 2019, testNumber: 1, parts: [] }],
  partPractice: [],
};

beforeEach(() => {
  mockLoad.mockReset();
  catalogStore.setState({ catalog: null, status: "idle", error: null });
});

describe("catalogStore", () => {
  it("starts idle with no catalog", () => {
    expect(catalogStore.getState()).toMatchObject({
      catalog: null,
      status: "idle",
      error: null,
    });
  });

  it("goes loading while fetching, then ready with the catalog", async () => {
    let resolveLoad!: (value: Catalog) => void;
    mockLoad.mockReturnValue(
      new Promise<Catalog>((resolve) => {
        resolveLoad = resolve;
      }),
    );

    const loading = catalogStore.getState().load();
    expect(catalogStore.getState().status).toBe("loading");

    resolveLoad(catalog);
    await loading;

    expect(catalogStore.getState()).toMatchObject({
      catalog,
      status: "ready",
      error: null,
    });
  });

  it("sets error state when the load fails", async () => {
    mockLoad.mockRejectedValue(new Error("read failed"));

    await catalogStore.getState().load();

    expect(catalogStore.getState()).toMatchObject({
      catalog: null,
      status: "error",
      error: "read failed",
    });
  });
});
