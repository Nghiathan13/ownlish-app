import { describe, expect, it, vi } from "vitest";
import { renderTestsNavbar } from "./tests-navbar";

describe("renderTestsNavbar", () => {
  it("renders a nav with a bordered back button containing an icon", () => {
    const navbar = renderTestsNavbar(vi.fn());
    expect(navbar.tagName).toBe("NAV");
    expect(navbar.classList.contains("test__navbar")).toBe(true);

    const back = navbar.querySelector<HTMLButtonElement>("button.test__back");
    expect(back).not.toBeNull();
    expect(back?.querySelector("svg")).not.toBeNull();
  });

  it("calls onBack when the back button is clicked", () => {
    const onBack = vi.fn();
    const navbar = renderTestsNavbar(onBack);
    navbar.querySelector<HTMLButtonElement>("button.test__back")?.click();
    expect(onBack).toHaveBeenCalledOnce();
  });
});
