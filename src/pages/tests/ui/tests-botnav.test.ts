import { describe, expect, it, vi } from "vitest";
import { renderTestsBotnav } from "./tests-botnav";

describe("renderTestsBotnav", () => {
  it("renders the prev/next chevron buttons", () => {
    const { element } = renderTestsBotnav({ onPrev: vi.fn(), onNext: vi.fn() });
    expect(element.tagName).toBe("NAV");
    expect(
      element.querySelector('button[aria-label="Previous question"]'),
    ).not.toBeNull();
    expect(
      element.querySelector('button[aria-label="Next question"]'),
    ).not.toBeNull();
  });

  it("starts with both buttons disabled", () => {
    const { element } = renderTestsBotnav({ onPrev: vi.fn(), onNext: vi.fn() });
    const prev = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous question"]',
    );
    const next = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );
    expect(prev?.disabled).toBe(true);
    expect(next?.disabled).toBe(true);
  });

  it("setNavigation enables and disables prev/next", () => {
    const { element, setNavigation } = renderTestsBotnav({
      onPrev: vi.fn(),
      onNext: vi.fn(),
    });
    const prev = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous question"]',
    );
    const next = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Next question"]',
    );

    setNavigation(true, false);
    expect(prev?.disabled).toBe(false);
    expect(next?.disabled).toBe(true);

    setNavigation(false, true);
    expect(prev?.disabled).toBe(true);
    expect(next?.disabled).toBe(false);
  });

  it("calls onPrev and onNext when clicked", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const { element, setNavigation } = renderTestsBotnav({ onPrev, onNext });
    setNavigation(true, true);

    element
      .querySelector<HTMLButtonElement>('button[aria-label="Previous question"]')
      ?.click();
    element
      .querySelector<HTMLButtonElement>('button[aria-label="Next question"]')
      ?.click();

    expect(onPrev).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });
});
