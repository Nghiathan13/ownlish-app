import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import type { Catalog } from "@/entities/toeic-catalog";

const catalog: Catalog = {
  schemaVersion: 1,
  tests: [{ id: "ets19-t01", year: 2019, testNumber: 1, parts: [] }],
  partPractice: [],
};

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
});

afterEach(() => {
  vi.resetModules();
  document.body.innerHTML = "";
});

describe("bootstrap (main.ts)", () => {
  it("renders the tests overview after the catalog loads", async () => {
    mockIPC((cmd) => {
      if (cmd === "read_catalog") return JSON.stringify(catalog);
      return [];
    });

    await import("./main");

    await vi.waitFor(() =>
      expect(document.querySelector(".tests__grid")).not.toBeNull(),
    );
    expect(document.querySelectorAll("button.tests__card")).toHaveLength(1);
  });

  it("shows an error message when the catalog fails to load", async () => {
    mockIPC(() => {
      throw new Error("boom");
    });

    await import("./main");

    await vi.waitFor(() =>
      expect(document.querySelector("#app")?.textContent).toBe(
        "catalog load failed",
      ),
    );
  });
});
