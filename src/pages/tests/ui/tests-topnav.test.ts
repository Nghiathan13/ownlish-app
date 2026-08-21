import { describe, expect, it, vi } from "vitest";
import { renderTestsTopnav } from "./tests-topnav";

describe("renderTestsTopnav", () => {
  it("renders a nav with a bordered back button containing an icon", () => {
    const topnav = renderTestsTopnav(vi.fn());
    expect(topnav.tagName).toBe("NAV");
    expect(topnav.classList.contains("test__topnav")).toBe(true);

    const back = topnav.querySelector<HTMLButtonElement>(
      'button[aria-label="Back"]',
    );
    expect(back).not.toBeNull();
    expect(back?.classList.contains("button--bordered")).toBe(true);
    expect(back?.querySelector("svg")).not.toBeNull();
  });

  it("calls onBack when the back button is clicked", () => {
    const onBack = vi.fn();
    const topnav = renderTestsTopnav(onBack);
    topnav.querySelector<HTMLButtonElement>('button[aria-label="Back"]')?.click();
    expect(onBack).toHaveBeenCalledOnce();
  });
});
