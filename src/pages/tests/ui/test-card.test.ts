import { describe, expect, it, vi } from "vitest";
import type { CatalogTest } from "@/entities/toeic-catalog";
import type { TestCardViewModel } from "../lib/tests";
import { renderTestCard } from "./test-card";

const model: TestCardViewModel = {
  id: "ets19-t01",
  year: 2019,
  testNumber: 1,
  seriesLabel: "ETS",
  complete: true,
};

const test: CatalogTest = {
  id: "ets19-t01",
  year: 2019,
  testNumber: 1,
  parts: [],
};

describe("renderTestCard", () => {
  it("renders a button with the id and the full title", () => {
    const card = renderTestCard(model, test, vi.fn());
    expect(card.tagName).toBe("BUTTON");
    expect(card.textContent).toBe("ets19-t01");
    expect(card.title).toBe("ETS 2019 · Test 1");
  });

  it("marks incomplete tests in the title", () => {
    const card = renderTestCard({ ...model, complete: false }, test, vi.fn());
    expect(card.title).toBe("ETS 2019 · Test 1 (incomplete)");
  });

  it("calls onSelect with the test on click", () => {
    const onSelect = vi.fn();
    const card = renderTestCard(model, test, onSelect);
    card.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onSelect).toHaveBeenCalledWith(test);
  });
});
