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
  it("renders the shell with the tests overview and tests nav active", () => {
    const root = document.createElement("div");
    createRouter(root)("tests");

    expect(root.querySelector(".shell")).not.toBeNull();
    expect(root.querySelector(".tests__grid")).not.toBeNull();
    const active = root.querySelector<HTMLButtonElement>(
      "button.shell__nav[aria-current='page']",
    );
    expect(active?.getAttribute("aria-label")).toBe("Tests");
  });

  it("renders the dashboard page with the dashboard nav active", () => {
    const root = document.createElement("div");
    createRouter(root)("dashboard");

    expect(root.querySelector(".dashboard__title")?.textContent).toBe("Dashboard");
    const active = root.querySelector<HTMLButtonElement>(
      "button.shell__nav[aria-current='page']",
    );
    expect(active?.getAttribute("aria-label")).toBe("Dashboard");
  });

  it("renders the study page with a back button for the selected test", () => {
    const root = document.createElement("div");
    createRouter(root)("test", catalog.tests[0]);
    expect(root.querySelector("button.test__back")).not.toBeNull();
  });

  it("navigates to the study page when a card is clicked", () => {
    const root = document.createElement("div");
    const navigate = createRouter(root);
    navigate("tests");
    root.querySelector<HTMLButtonElement>("button.tests__card")?.click();
    expect(root.querySelector("button.test__back")).not.toBeNull();
  });

  it("returns to the overview when the back button is clicked", () => {
    const root = document.createElement("div");
    const navigate = createRouter(root);
    navigate("test", catalog.tests[0]);
    root.querySelector<HTMLButtonElement>("button.test__back")?.click();
    expect(root.querySelector(".tests__grid")).not.toBeNull();
  });

  it("falls back to the overview when navigating to test without a test", () => {
    const root = document.createElement("div");
    createRouter(root)("test");
    expect(root.querySelector(".tests__grid")).not.toBeNull();
  });
});
