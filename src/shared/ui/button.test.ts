import { describe, expect, it, vi } from "vitest";
import { createIconButton } from "./button";

describe("createIconButton", () => {
  it("creates an icon button with an aria-label", () => {
    const button = createIconButton({
      icon: "arrow-left",
      label: "Back",
      variant: "bordered",
      onClick: vi.fn(),
    });
    expect(button.tagName).toBe("BUTTON");
    expect(button.classList.contains("button--bordered")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("Back");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("creates a ghost variant without the bordered class", () => {
    const button = createIconButton({
      icon: "file-text",
      label: "Tests",
      variant: "ghost",
      onClick: vi.fn(),
    });
    expect(button.classList.contains("button--ghost")).toBe(true);
    expect(button.classList.contains("button--bordered")).toBe(false);
  });

  it("marks the button active with aria-current when active", () => {
    const button = createIconButton({
      icon: "layout-dashboard",
      label: "Dashboard",
      variant: "ghost",
      active: true,
      onClick: vi.fn(),
    });
    expect(button.classList.contains("button--active")).toBe(true);
    expect(button.getAttribute("aria-current")).toBe("page");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    const button = createIconButton({
      icon: "arrow-left",
      label: "Back",
      variant: "bordered",
      onClick,
    });
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
