import { describe, expect, it } from "vitest";
import { renderTestsDocuments } from "./tests-documents";

function documentText(element: HTMLElement, selector: string): string {
  return element.querySelector(selector)?.textContent ?? "";
}

function isElementHidden(element: HTMLElement, selector: string): boolean {
  return element.querySelector<HTMLElement>(selector)?.hidden === true;
}

describe("renderTestsDocuments", () => {
  it("creates 3 document slots with kind and transcript paragraphs", () => {
    const { elements } = renderTestsDocuments();
    expect(elements).toHaveLength(3);
    for (const element of elements) {
      expect(element.className).toBe("test__document");
      expect(element.hidden).toBe(true);
      expect(element.querySelector(".test__kind")).not.toBeNull();
      expect(element.querySelector(".test__transcript")).not.toBeNull();
    }
  });

  it("sets a single document on slot 0 and keeps other slots hidden", () => {
    const { elements, setDocuments } = renderTestsDocuments();
    setDocuments([
      { kind: "announcement", content: "Come to the workshop." },
    ]);

    expect(elements[0].hidden).toBe(false);
    expect(documentText(elements[0], ".test__kind")).toBe("announcement");
    expect(documentText(elements[0], ".test__transcript")).toBe(
      "Come to the workshop.",
    );
    expect(isElementHidden(elements[0], ".test__kind")).toBe(false);
    expect(isElementHidden(elements[0], ".test__transcript")).toBe(false);
    expect(elements[1].hidden).toBe(true);
    expect(elements[2].hidden).toBe(true);
  });

  it("sets multiple documents for multi-passage clusters", () => {
    const { elements, setDocuments } = renderTestsDocuments();
    setDocuments([
      { kind: "press_release", content: "First passage" },
      { kind: "review", content: "Second passage" },
    ]);

    expect(elements[0].hidden).toBe(false);
    expect(documentText(elements[0], ".test__kind")).toBe("press_release");
    expect(documentText(elements[0], ".test__transcript")).toBe("First passage");

    expect(elements[1].hidden).toBe(false);
    expect(documentText(elements[1], ".test__kind")).toBe("review");
    expect(documentText(elements[1], ".test__transcript")).toBe("Second passage");

    expect(elements[2].hidden).toBe(true);
  });

  it("hides kind or transcript when they are empty strings", () => {
    const { elements, setDocuments } = renderTestsDocuments();
    setDocuments([{ kind: "", content: "Transcript only" }]);

    expect(elements[0].hidden).toBe(false);
    expect(isElementHidden(elements[0], ".test__kind")).toBe(true);
    expect(isElementHidden(elements[0], ".test__transcript")).toBe(false);
    expect(documentText(elements[0], ".test__transcript")).toBe("Transcript only");
  });

  it("clears and hides all slots when given an empty list", () => {
    const { elements, setDocuments } = renderTestsDocuments();
    setDocuments([{ kind: "email", content: "Hello" }]);
    expect(elements[0].hidden).toBe(false);

    setDocuments([]);
    for (const element of elements) {
      expect(element.hidden).toBe(true);
      expect(documentText(element, ".test__kind")).toBe("");
      expect(documentText(element, ".test__transcript")).toBe("");
    }
  });
});

