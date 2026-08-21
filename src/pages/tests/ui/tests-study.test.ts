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
    { key: "B", en: "She's looking in a display case.", vi: "Cô ấy đang nhìn tủ." },
    { key: "C", en: "She's paying for a purchase.", vi: "Cô ấy đang thanh toán." },
    { key: "D", en: "She's holding some flowers.", vi: "Cô ấy đang cầm hoa." },
  ],
};

const question2 = {
  id: "ets19-t01-p1-q002",
  number: 2,
  question: { en: "When did you buy your new phone?" },
  options: [{ key: "A", en: "The man is seated by a window." }],
};

const partContent = JSON.stringify({ items: [question1, question2] });

function statusText(root: HTMLElement): string {
  return root.querySelector(".test__status")?.textContent ?? "";
}

function visibleDocuments(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(".test__document")].filter(
    (element) => !element.hidden,
  );
}

function transcriptText(root: HTMLElement, slot = 0): string {
  return (
    visibleDocuments(root)
      [slot]?.querySelector(".test__transcript")?.textContent ?? ""
  );
}

function kindText(root: HTMLElement, slot = 0): string {
  return (
    visibleDocuments(root)[slot]?.querySelector(".test__kind")?.textContent ??
    ""
  );
}

function visibleQuestions(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(".test__question")].filter(
    (element) => !element.hidden,
  );
}

function optionText(root: HTMLElement, key: string, slot = 0): string {
  return (
    visibleQuestions(root)
      [slot]?.querySelector(`[data-key="${key}"] .test__option-text`)
      ?.textContent ?? ""
  );
}

function questionNumber(root: HTMLElement, slot = 0): string {
  return (
    visibleQuestions(root)
      [slot]?.querySelector(".test__question-number")?.textContent ?? ""
  );
}

function questionNumbers(root: HTMLElement): string[] {
  return visibleQuestions(root).map(
    (element) =>
      element.querySelector(".test__question-number")?.textContent ?? "",
  );
}

function questionStem(root: HTMLElement, slot = 0): string {
  return (
    visibleQuestions(root)
      [slot]?.querySelector(".test__question-text")?.textContent ?? ""
  );
}

function optionHidden(root: HTMLElement, key: string, slot = 0): boolean {
  return (
    visibleQuestions(root)
      [slot]?.querySelector<HTMLElement>(`[data-key="${key}"]`)?.hidden === true
  );
}

async function waitForFirstOption(root: HTMLElement, text: string): Promise<void> {
  await vi.waitFor(() => expect(optionText(root, "A")).toBe(text));
}

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

    await vi.waitFor(() => expect(statusText(root)).toBe("no parts found"));
    expect(visibleQuestions(root)).toHaveLength(0);
  });

  it("shows a no-questions placeholder when the part has no items", async () => {
    mockIPC(() => [
      { path: "content/toeic/ets19-t01/part_1.json", content: "{\"items\":[]}" },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() => expect(statusText(root)).toBe("no questions found"));
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

  it("renders the first question's English options into the A–D slots", async () => {
    mockIPC(() => [
      { path: "content/toeic/ets19-t01/part_1.json", content: partContent },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await waitForFirstOption(root, question1.options[0].en);
    expect(questionNumber(root)).toBe("1.");
    expect(optionText(root, "B")).toBe(question1.options[1].en);
    expect(optionText(root, "C")).toBe(question1.options[2].en);
    expect(optionText(root, "D")).toBe(question1.options[3].en);
    expect(optionHidden(root, "D")).toBe(false);
    expect(statusText(root)).toBe("");
  });

  it("renders a blank unit without treating it as a question", async () => {
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: JSON.stringify({ items: [null, { id: "q2" }] }),
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    await vi.waitFor(() => expect(next?.disabled).toBe(false));
    expect(questionNumber(root)).toBe("1.");
    expect(optionText(root, "A")).toBe("");
    expect(statusText(root)).toBe("");
  });

  it("navigates to the next question and enables prev", async () => {
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: partContent,
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await waitForFirstOption(root, question1.options[0].en);
    const prev = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous question"]',
    );
    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    expect(prev?.disabled).toBe(true);
    expect(next?.disabled).toBe(false);

    next?.click();
    expect(questionNumber(root)).toBe("2.");
    expect(questionStem(root)).toBe("");
    expect(optionText(root, "A")).toBe(question2.options[0].en);
    expect(optionHidden(root, "D")).toBe(true);
    expect(prev?.disabled).toBe(false);
    expect(next?.disabled).toBe(true);

    prev?.click();
    expect(questionNumber(root)).toBe("1.");
    expect(optionText(root, "A")).toBe(question1.options[0].en);
    expect(optionHidden(root, "D")).toBe(false);
    expect(prev?.disabled).toBe(true);
    expect(next?.disabled).toBe(false);
  });

  it("navigates across parts (items then groups)", async () => {
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: JSON.stringify({
          items: Array.from({ length: 31 }, (_, index) => ({ id: `q${index}` })),
        }),
      },
      {
        path: "content/toeic/ets19-t01/part_2.json",
        content: JSON.stringify({
          groups: [
            {
              id: "g1",
              transcript: {
                en: [
                  { text: "Thanks for calling. " },
                  { text: "How can I help you?" },
                ],
              },
              questions: [
                {
                  number: 33,
                  question: { en: "Why is the woman calling?" },
                  options: [{ key: "A", en: "To ask about a fee" }],
                },
                {
                  number: 32,
                  question: { en: "What has recently changed?" },
                  options: [
                    { key: "A", en: "Office hours" },
                    { key: "B", en: "A company policy" },
                    { key: "C", en: "Job requirements" },
                    { key: "D", en: "A computer system" },
                  ],
                },
                {
                  number: 34,
                  question: { en: "What does the man agree to do?" },
                  options: [{ key: "A", en: "Waive a fee" }],
                },
              ],
            },
            {
              id: "g2",
              transcript: { en: [{ text: "Palmer's Gym now has several locations." }] },
              questions: [],
            },
          ],
        }),
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    await vi.waitFor(() => expect(next?.disabled).toBe(false));
    expect(questionNumbers(root)).toEqual(["1."]);
    expect(transcriptText(root)).toBe("");
    for (let step = 0; step < 31; step += 1) next?.click();
    expect(questionNumbers(root)).toEqual(["32.", "33.", "34."]);
    expect(kindText(root)).toBe("");
    expect(transcriptText(root)).toBe("Thanks for calling. How can I help you?");
    expect(questionStem(root, 0)).toBe("What has recently changed?");
    expect(questionStem(root, 1)).toBe("Why is the woman calling?");
    expect(questionStem(root, 2)).toBe("What does the man agree to do?");
    expect(optionText(root, "A", 0)).toBe("Office hours");
    expect(optionText(root, "B", 0)).toBe("A company policy");
    expect(optionHidden(root, "D", 0)).toBe(false);
    expect(optionText(root, "A", 1)).toBe("To ask about a fee");
    expect(optionHidden(root, "D", 1)).toBe(true);
    expect(optionText(root, "A", 2)).toBe("Waive a fee");
    next?.click();
    expect(questionNumbers(root)).toEqual(["35.", "36.", "37."]);
    expect(transcriptText(root)).toBe("Palmer's Gym now has several locations.");
    expect(statusText(root)).toBe("");
  });

  it("labels Part 5 items from index 54 as 101", async () => {
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: JSON.stringify({
          items: [
            ...Array.from({ length: 54 }, (_, index) => ({ id: `q${index}` })),
            {
              id: "q101",
              question: {
                en: "Ms. Durkin asked for volunteers to help ______.",
              },
              options: [{ key: "A", en: "her" }, { key: "B", en: "she" }],
            },
          ],
        }),
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    await vi.waitFor(() => expect(next?.disabled).toBe(false));
    for (let step = 0; step < 54; step += 1) next?.click();
    expect(questionNumber(root)).toBe("101.");
    expect(questionStem(root)).toBe(
      "Ms. Durkin asked for volunteers to help ______.",
    );
    expect(optionText(root, "A")).toBe("her");
  });

  it("renders Part 6 groups from index 84 as 131–134", async () => {
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: JSON.stringify({
          items: Array.from({ length: 84 }, (_, index) => ({ id: `q${index}` })),
        }),
      },
      {
        path: "content/toeic/ets19-t01/part_2.json",
        content: JSON.stringify({
          groups: [
            {
              id: "g131",
              kind: "announcement",
              content: { en: "Come to the workshop. ___131___ ." },
              questions: [
                {
                  number: 131,
                  options: [{ key: "A", en: "Next Saturday at 4 P.M." }],
                },
                { number: 132, options: [{ key: "A", en: "that uses" }] },
                { number: 133, options: [{ key: "A", en: "Best of all" }] },
                { number: 134, options: [{ key: "A", en: "they" }] },
              ],
            },
          ],
        }),
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    await vi.waitFor(() => expect(next?.disabled).toBe(false));
    for (let step = 0; step < 84; step += 1) next?.click();
    expect(questionNumbers(root)).toEqual(["131.", "132.", "133.", "134."]);
    expect(kindText(root)).toBe("announcement");
    expect(transcriptText(root)).toBe("Come to the workshop. ___131___ .");
    expect(questionStem(root, 0)).toBe("");
    expect(optionText(root, "A", 0)).toBe("Next Saturday at 4 P.M.");
    expect(optionText(root, "A", 3)).toBe("they");
  });

  it("renders Part 7 clusters from documents and question numbers", async () => {
    mockIPC(() => [
      {
        path: "content/toeic/ets19-t01/part_1.json",
        content: JSON.stringify({
          items: Array.from({ length: 88 }, (_, index) => ({ id: `q${index}` })),
        }),
      },
      {
        path: "content/toeic/ets19-t01/part_2.json",
        content: JSON.stringify({
          groups: [
            {
              id: "g147",
              documents: [
                { kind: "press_release", content: { en: "Orbys announced a change." } },
                { kind: "review", content: { en: "Customers were pleased." } },
              ],
              questions: [
                {
                  number: 148,
                  question: { en: "What is indicated about the company?" },
                  options: [{ key: "A", en: "It changed a policy." }],
                },
                {
                  number: 147,
                  question: { en: "Where is the information most likely found?" },
                  options: [
                    { key: "A", en: "In a box" },
                    { key: "B", en: "On a Web site" },
                    { key: "C", en: "On a receipt" },
                    { key: "D", en: "On a door" },
                  ],
                },
              ],
            },
          ],
        }),
      },
    ]);
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    const next = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    await vi.waitFor(() => expect(next?.disabled).toBe(false));
    for (let step = 0; step < 88; step += 1) next?.click();
    expect(kindText(root, 0)).toBe("press_release");
    expect(transcriptText(root, 0)).toBe("Orbys announced a change.");
    expect(kindText(root, 1)).toBe("review");
    expect(transcriptText(root, 1)).toBe("Customers were pleased.");
    expect(questionNumbers(root)).toEqual(["147.", "148."]);
    expect(questionStem(root, 0)).toBe(
      "Where is the information most likely found?",
    );
    expect(optionText(root, "A", 0)).toBe("In a box");
    expect(questionStem(root, 1)).toBe("What is indicated about the company?");
  });

  it("shows an error state when the preload fails", async () => {
    mockIPC(() => {
      throw new Error("fs error");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = document.createElement("div");
    renderTestsStudyPage(root, test, vi.fn());

    await vi.waitFor(() =>
      expect(statusText(root)).toBe("failed to load test parts"),
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("preload failed for ets19-t01"),
      expect.any(Error),
    );
  });
});
