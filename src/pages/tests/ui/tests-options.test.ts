import { describe, expect, it } from "vitest";
import { EMPTY_OPTIONS, OPTION_KEYS } from "../lib/test-options";
import { renderTestsOptions } from "./tests-options";

function questionText(element: HTMLElement, selector: string): string {
  return element.querySelector(selector)?.textContent ?? "";
}

function optionText(element: HTMLElement, key: string): string {
  return (
    element.querySelector(`[data-key="${key}"] .test__option-text`)?.textContent ??
    ""
  );
}

function optionRow(element: HTMLElement, key: string): HTMLElement | null {
  return element.querySelector<HTMLElement>(`[data-key="${key}"]`);
}

describe("renderTestsOptions", () => {
  it("creates 5 question slots with prompt and four A–D option rows", () => {
    const { elements } = renderTestsOptions();
    expect(elements).toHaveLength(5);
    for (const element of elements) {
      expect(element.className).toBe("test__question");
      expect(element.hidden).toBe(true);
      const rows = element.querySelectorAll(".test__option");
      expect(rows).toHaveLength(4);
      expect(
        [...rows].map((row) => [
          row.getAttribute("data-key"),
          row.querySelector(".test__option-key")?.textContent,
        ]),
      ).toEqual(OPTION_KEYS.map((key) => [key, `${key}.`]));
    }
  });

  it("sets a single question on slot 0 and keeps other slots hidden", () => {
    const { elements, setQuestions } = renderTestsOptions();
    setQuestions([
      {
        label: "101.",
        stem: "Ms. Durkin asked for volunteers.",
        options: [
          { key: "A", en: "her" },
          { key: "B", en: "she" },
          { key: "E", en: "unknown" },
        ],
      },
    ]);

    expect(elements[0].hidden).toBe(false);
    expect(questionText(elements[0], ".test__question-number")).toBe("101.");
    expect(questionText(elements[0], ".test__question-text")).toBe(
      "Ms. Durkin asked for volunteers.",
    );
    expect(optionText(elements[0], "A")).toBe("her");
    expect(optionText(elements[0], "B")).toBe("she");
    expect(
      elements[0].querySelector('[data-key="A"] .test__option-content')?.textContent,
    ).toBe("A. her");
    expect(optionRow(elements[0], "A")?.hidden).toBe(false);
    expect(optionRow(elements[0], "C")?.hidden).toBe(true);
    expect(elements[1].hidden).toBe(true);
  });

  it("sets multiple questions for groups and hides remaining slots", () => {
    const { elements, setQuestions } = renderTestsOptions();
    setQuestions([
      {
        label: "131.",
        stem: "",
        options: [{ key: "A", en: "Opt 131" }],
      },
      {
        label: "132.",
        stem: "Stem 132",
        options: [{ key: "A", en: "Opt 132" }],
      },
    ]);

    expect(elements[0].hidden).toBe(false);
    expect(questionText(elements[0], ".test__question-number")).toBe("131.");
    expect(elements[0].querySelector<HTMLElement>(".test__question-text")?.hidden).toBe(true);

    expect(elements[1].hidden).toBe(false);
    expect(questionText(elements[1], ".test__question-number")).toBe("132.");
    expect(questionText(elements[1], ".test__question-text")).toBe("Stem 132");

    expect(elements[2].hidden).toBe(true);
    expect(elements[3].hidden).toBe(true);
    expect(elements[4].hidden).toBe(true);
  });

  it("keeps empty A–D labels visible when empty options are provided", () => {
    const { elements, setQuestions } = renderTestsOptions();
    setQuestions([{ label: "1.", stem: "", options: EMPTY_OPTIONS }]);

    for (const key of OPTION_KEYS) {
      expect(optionRow(elements[0], key)?.hidden).toBe(false);
      expect(optionText(elements[0], key)).toBe("");
    }
  });

  it("clears and hides all slots when given an empty list", () => {
    const { elements, setQuestions } = renderTestsOptions();
    setQuestions([
      {
        label: "1.",
        stem: "Prompt",
        options: [{ key: "A", en: "One" }],
      },
    ]);
    expect(elements[0].hidden).toBe(false);

    setQuestions([]);
    for (const element of elements) {
      expect(element.hidden).toBe(true);
      expect(questionText(element, ".test__question-number")).toBe("");
      expect(questionText(element, ".test__question-text")).toBe("");
    }
  });

  it("selects an option on click and deselects other options", () => {
    const { elements, setQuestions } = renderTestsOptions();
    setQuestions([
      {
        label: "1.",
        stem: "",
        options: [
          { key: "A", en: "Opt A" },
          { key: "B", en: "Opt B" },
        ],
      },
    ]);

    const rowA = optionRow(elements[0], "A");
    const rowB = optionRow(elements[0], "B");

    expect(rowA?.querySelector(".test__option-icon svg")).not.toBeNull();
    expect(rowA?.querySelector<HTMLElement>(".test__option-icon")?.style.width).toBe("18px");
    expect(rowA?.classList.contains("test__option--selected")).toBe(false);
    expect(rowA?.getAttribute("aria-selected")).toBe("false");

    rowA?.click();
    expect(rowA?.classList.contains("test__option--selected")).toBe(true);
    expect(rowA?.getAttribute("aria-selected")).toBe("true");
    expect(rowA?.querySelector(".test__option-icon")?.innerHTML).toContain("circle");
    expect(rowB?.classList.contains("test__option--selected")).toBe(false);
    expect(rowB?.getAttribute("aria-selected")).toBe("false");

    rowB?.click();
    expect(rowA?.classList.contains("test__option--selected")).toBe(false);
    expect(rowA?.getAttribute("aria-selected")).toBe("false");
    expect(rowB?.classList.contains("test__option--selected")).toBe(true);
    expect(rowB?.getAttribute("aria-selected")).toBe("true");
  });

  it("selects an option on Enter and Space keydown", () => {
    const { elements, setQuestions } = renderTestsOptions();
    setQuestions([
      {
        label: "1.",
        stem: "",
        options: [
          { key: "A", en: "Opt A" },
          { key: "B", en: "Opt B" },
        ],
      },
    ]);

    const rowA = optionRow(elements[0], "A");
    const rowB = optionRow(elements[0], "B");

    rowA?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(rowA?.classList.contains("test__option--selected")).toBe(true);

    rowB?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(rowB?.classList.contains("test__option--selected")).toBe(true);
    expect(rowA?.classList.contains("test__option--selected")).toBe(false);

    // Other keys do nothing
    rowA?.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(rowB?.classList.contains("test__option--selected")).toBe(true);
  });

  it("restores pre-selected option when specified in question data", () => {
    const { elements, setQuestions } = renderTestsOptions();
    setQuestions([
      {
        label: "1.",
        stem: "",
        options: [
          { key: "A", en: "Opt A" },
          { key: "B", en: "Opt B" },
        ],
        selected: "B",
      },
    ]);

    const rowA = optionRow(elements[0], "A");
    const rowB = optionRow(elements[0], "B");

    expect(rowA?.classList.contains("test__option--selected")).toBe(false);
    expect(rowB?.classList.contains("test__option--selected")).toBe(true);
    expect(rowB?.getAttribute("aria-selected")).toBe("true");
  });
});
