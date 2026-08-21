import { beforeEach, describe, expect, it } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import { catalogStore } from "@/entities/toeic-catalog";
import type { Catalog } from "@/entities/toeic-catalog";
import { createRouter } from "./router";

const catalog: Catalog = {
  schemaVersion: 1,
  tests: [{ id: "ets19-t01", year: 2019, testNumber: 1, parts: [] }],
  partPractice: [],
};

beforeEach(() => {
  catalogStore.setState({ catalog, status: "ready", error: null });
  mockIPC((cmd) => {
    if (cmd === "read_content_files") return [];
    return undefined;
  });
});

describe("createRouter", () => {
  it("renders the tests overview on the tests route", () => {
    const root = document.createElement("div");
    createRouter(root)("tests");
    expect(root.querySelector(".tests__grid")).not.toBeNull();
    expect(root.querySelectorAll("button.tests__card")).toHaveLength(1);
  });

  it("renders the study page with the selected test", () => {
    const root = document.createElement("div");
    createRouter(root)("test", catalog.tests[0]);
    expect(root.querySelector(".test__text")?.textContent).toBe("ets19-t01");
  });

  it("navigates to the study page when a card is clicked", () => {
    const root = document.createElement("div");
    const navigate = createRouter(root);
    navigate("tests");
    root.querySelector<HTMLButtonElement>("button.tests__card")?.click();
    expect(root.querySelector(".test__text")?.textContent).toBe("ets19-t01");
  });

  it("falls back to the overview when navigating to test without a test", () => {
    const root = document.createElement("div");
    createRouter(root)("test");
    expect(root.querySelector(".tests__grid")).not.toBeNull();
  });
});
