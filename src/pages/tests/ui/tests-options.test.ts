import { describe, expect, it } from "vitest";
import { EMPTY_OPTIONS, OPTION_KEYS } from "../lib/test-options";
import { renderTestsOptions } from "./tests-options";

function optionText(root: HTMLElement, key: string): string {
  return (
    root.querySelector(`[data-key="${key}"] .test__option-text`)?.textContent ??
    ""
  );
}

function optionRow(root: HTMLElement, key: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-key="${key}"]`);
}

describe("renderTestsOptions", () => {
  it("creates four A–D rows with fixed labels", () => {
    const { element } = renderTestsOptions();
    const rows = element.querySelectorAll(".test__option");
    expect(element.tagName).toBe("UL");
    expect(rows).toHaveLength(4);
    expect(
      [...rows].map((row) => [
        row.getAttribute("data-key"),
        row.querySelector(".test__option-key")?.textContent,
      ]),
    ).toEqual(OPTION_KEYS.map((key) => [key, `${key}.`]));
  });

  it("writes English text by key and ignores unknown keys", () => {
    const { element, setOptions } = renderTestsOptions();
    setOptions([
      { key: "D", en: "Flowers" },
      { key: "A", en: "Handbag" },
      { key: "E", en: "Skip" },
    ]);
    expect(optionText(element, "A")).toBe("Handbag");
    expect(optionText(element, "D")).toBe("Flowers");
    expect(optionRow(element, "A")?.hidden).toBe(false);
    expect(optionRow(element, "B")?.hidden).toBe(true);
    expect(optionRow(element, "C")?.hidden).toBe(true);
    expect(optionRow(element, "D")?.hidden).toBe(false);
  });

  it("keeps empty A–D labels visible when the keys are present", () => {
    const { element, setOptions } = renderTestsOptions();
    setOptions(EMPTY_OPTIONS);
    for (const key of OPTION_KEYS) {
      expect(optionRow(element, key)?.hidden).toBe(false);
      expect(optionText(element, key)).toBe("");
    }
  });

  it("hides D when the slot is empty and shows it again when filled", () => {
    const { element, setOptions } = renderTestsOptions();
    setOptions([
      { key: "A", en: "One" },
      { key: "B", en: "Two" },
      { key: "C", en: "Three" },
    ]);
    expect(optionRow(element, "D")?.hidden).toBe(true);

    setOptions([
      { key: "A", en: "One" },
      { key: "B", en: "Two" },
      { key: "C", en: "Three" },
      { key: "D", en: "Four" },
    ]);
    expect(optionRow(element, "D")?.hidden).toBe(false);
    expect(optionText(element, "D")).toBe("Four");
  });

  it("clears leftover text when the next unit has fewer options", () => {
    const { element, setOptions } = renderTestsOptions();
    setOptions([
      { key: "A", en: "One" },
      { key: "B", en: "Two" },
      { key: "C", en: "Three" },
      { key: "D", en: "Four" },
    ]);
    setOptions(null);
    for (const key of OPTION_KEYS) {
      expect(optionText(element, key)).toBe("");
      expect(optionRow(element, key)?.hidden).toBe(true);
    }
  });
});
