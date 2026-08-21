import { afterEach, describe, expect, it, vi } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("renderTestsStudyPage", () => {
  it("renders the selected test id", () => {
    mockIPC(() => []);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test);
    expect(root.querySelector(".test__text")?.textContent).toBe("ets19-t01");
  });

  it("preloads part files via read_content_files with the test paths", async () => {
    const calls: Array<[string, unknown]> = [];
    mockIPC((cmd, args) => {
      calls.push([cmd, args]);
      return [];
    });

    const root = document.createElement("div");
    renderTestsStudyPage(root, test);

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

  it("logs a summary counting files with content", async () => {
    mockIPC(() => [
      { path: "content/toeic/ets19-t01/part_1.json", content: '{"groups":[]}' },
      { path: "content/toeic/ets19-t01/part_2.json", content: "   " },
    ]);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const root = document.createElement("div");
    renderTestsStudyPage(root, test);

    await vi.waitFor(() => expect(logSpy).toHaveBeenCalledOnce());
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("2 part files loaded, 1 with content"),
    );
  });

  it("logs preload failures via console.error", async () => {
    mockIPC(() => {
      throw new Error("fs error");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const root = document.createElement("div");
    renderTestsStudyPage(root, test);

    await vi.waitFor(() => expect(errorSpy).toHaveBeenCalledOnce());
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("preload failed for ets19-t01"),
      expect.any(Error),
    );
  });
});
