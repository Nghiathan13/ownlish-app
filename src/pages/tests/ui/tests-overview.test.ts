import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogStore } from "@/entities/toeic-catalog";
import type { Catalog } from "@/entities/toeic-catalog";
import { renderTestsOverviewPage } from "./tests-overview";

const catalog: Catalog = {
  schemaVersion: 1,
  tests: [
    { id: "ets19-t01", year: 2019, testNumber: 1, parts: [] },
    { id: "ybm26-t03", year: 2026, testNumber: 3, parts: [] },
  ],
  partPractice: [],
};

beforeEach(() => {
  catalogStore.setState({ catalog, status: "ready", error: null });
});

describe("renderTestsOverviewPage", () => {
  it("renders one card per test", () => {
    const root = document.createElement("div");
    renderTestsOverviewPage(root, vi.fn());
    expect(root.querySelectorAll("button.tests__card")).toHaveLength(2);
  });

  it("forwards the selected test on click", () => {
    const root = document.createElement("div");
    const onSelect = vi.fn();
    renderTestsOverviewPage(root, onSelect);
    const cards = root.querySelectorAll<HTMLButtonElement>("button.tests__card");
    cards[1].click();
    expect(onSelect).toHaveBeenCalledWith(catalog.tests[1]);
  });

  it("renders nothing when the catalog is not loaded", () => {
    catalogStore.setState({ catalog: null, status: "idle", error: null });
    const root = document.createElement("div");
    renderTestsOverviewPage(root, vi.fn());
    expect(root.querySelectorAll("button")).toHaveLength(0);
  });
});
