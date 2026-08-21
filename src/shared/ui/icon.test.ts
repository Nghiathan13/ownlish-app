import { describe, expect, it } from "vitest";
import { createIcon, ICONS } from "./icon";

describe("createIcon", () => {
  it("creates a span wrapping the icon svg", () => {
    const icon = createIcon("play");
    expect(icon.tagName).toBe("SPAN");
    expect(icon.classList.contains("icon")).toBe(true);
    expect(icon.querySelector("svg")).not.toBeNull();
  });

  it("applies the requested size", () => {
    const icon = createIcon("check", 24);
    expect(icon.style.width).toBe("24px");
    expect(icon.style.height).toBe("24px");
  });

  it("is decorative (aria-hidden)", () => {
    const icon = createIcon("menu");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders every registered icon", () => {
    for (const name of Object.keys(ICONS) as Array<keyof typeof ICONS>) {
      const icon = createIcon(name);
      expect(icon.querySelector("svg"), name).not.toBeNull();
    }
  });
});
