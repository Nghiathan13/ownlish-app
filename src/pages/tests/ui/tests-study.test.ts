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

const question1 = {
  id: "ets19-t01-p1-q001",
  number: 1,
  audio: "toeic/ets_19/test_01/audio/001.mp3",
  options: [
    { key: "A", en: "She's searching in her handbag.", vi: "Cô ấy đang lục tìm." },
  ],
};

const partContent = JSON.stringify({ items: [question1, { id: "q2" }] });

beforeEach(() => {
  queryClient.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("renderTestsStudyPage", () => {
  it("shows a no-parts placeholder when no part files exist", async () => {
    mockIPC(() => []);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__question-raw")?.textContent).toBe(
        "no parts found",
      ),
    );
  });

  it("shows a no-questions placeholder when the part has no items", async () => {
    mockIPC(() => [
      { path: "content/toeic/ets19-t01/part_1.json", content: "{\"items\":[]}" },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__question-raw")?.textContent).toBe(
        "no questions found",
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

  it("renders only the first question raw", async () => {
    mockIPC(() => [
      { path: "content/toeic/ets19-t01/part_1.json", content: partContent },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__question-raw")?.textContent).toBe(
        JSON.stringify(question1, null, 2),
      ),
    );
  });

  it("navigates to the next question and enables prev", async () => {
    const questions = [
      { id: "q1", number: 1 },
      { id: "q2", number: 2 },
    ];
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: JSON.stringify({ items: questions }),
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__question-raw")?.textContent).toBe(
        JSON.stringify(questions[0], null, 2),
      ),
    );
    const prev = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous question"]',
    );
    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    expect(prev?.disabled).toBe(true);
    expect(next?.disabled).toBe(false);

    next?.click();
    expect(root.querySelector(".test__question-raw")?.textContent).toBe(
      JSON.stringify(questions[1], null, 2),
    );
    expect(prev?.disabled).toBe(false);
    expect(next?.disabled).toBe(true);
  });

  it("navigates across parts (items then groups)", async () => {
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: JSON.stringify({ items: [{ id: "q1" }] }),
      },
      {
        path: "content/toeic/ets19-t01/part_2.json",
        content: JSON.stringify({
          groups: [{ id: "g1", questions: [{ id: "q2" }] }],
        }),
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__question-raw")?.textContent).toBe(
        JSON.stringify({ id: "q1" }, null, 2),
      ),
    );
    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    next?.click();
    expect(root.querySelector(".test__question-raw")?.textContent).toBe(
      JSON.stringify({ id: "g1", questions: [{ id: "q2" }] }, null, 2),
    );
  });

  it("shows an error state when the preload fails", async () => {
    mockIPC(() => {
      throw new Error("fs error");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(root.querySelector(".test__question-raw")?.textContent).toBe(
        "failed to load test parts",
      ),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("preload failed for ets19-t01"),
      expect.any(Error),
    );
  });
});
