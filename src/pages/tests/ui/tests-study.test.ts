import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import { queryClient } from "@/shared/api";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { renderTestsStudyPage } from "./tests-study";

const test: CatalogTest = {
  id: "ets19-t01",
  year: 2019,
  testNumber: 1,
  parts: [
    { number: 1, path: "content/toeic/ets19-t01/part_1.json", questionCount: 6 },
    { number: 2, path: "content/toeic/ets19-t01/part_2.json", questionCount: 25 },
  ],
};

beforeEach(() => {
  queryClient.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("renderTestsStudyPage", () => {
  it("renders a navbar with a bordered back button and calls onBack on click", () => {
    mockIPC(() => []);
    const root = document.createElement("div");
    const onBack = vi.fn();
    renderTestsStudyPage(root, test, onBack);

    const navbar = root.querySelector<HTMLElement>("nav.test__navbar");
    expect(navbar).not.toBeNull();
    const back = navbar?.querySelector<HTMLButtonElement>("button.test__back");
    expect(back).not.toBeNull();
    expect(back?.querySelector("svg")).not.toBeNull();
    back?.click();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("shows a placeholder when no parts exist", async () => {
    mockIPC(() => []);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__part-raw")?.textContent).toBe(
        "no parts found",
      ),
    );
  });

  it("preloads part files via read_content_files with the test paths", async () => {
    const calls: Array<[string, unknown]> = [];
    mockIPC((cmd, args) => {
      calls.push([cmd, args]);
      return [];
    });

    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() => expect(calls.length).toBe(1));
    expect(calls[0]).toEqual([
      "read_content_files",
      {
        paths: [
          "content/toeic/ets19-t01/part_1.json",
          "content/toeic/ets19-t01/part_2.json",
        ],
      },
    ]);
  });

  it("renders the first part file content raw", async () => {
    const part1 = JSON.stringify({ items: [{ id: "ets19-t01-p1-q001" }] });
    mockIPC(() => [
      { path: "content/toeic/ets19-t01/part_1.json", content: part1 },
      { path: "content/toeic/ets19-t01/part_2.json", content: "{}" },
    ]);

    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__part-raw")?.textContent).toBe(part1),
    );
  });

  it("shows an error state and logs when the preload fails", async () => {
    mockIPC(() => {
      throw new Error("fs error");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__part-raw")?.textContent).toBe(
        "failed to load test parts",
      ),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("preload failed for ets19-t01"),
      expect.any(Error),
    );
  });
});
