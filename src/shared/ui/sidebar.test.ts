import { describe, expect, it, vi } from "vitest";
import { renderSidebar, type SidebarItem } from "./sidebar";

const ITEMS: SidebarItem[] = [
  { id: "tests", label: "Tests", icon: "file-text" },
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
];

describe("renderSidebar", () => {
  it("renders an icon nav button per item", () => {
    const sidebar = renderSidebar(ITEMS, "tests", vi.fn());
    expect(sidebar.tagName).toBe("NAV");
    expect(sidebar.classList.contains("shell__sidebar")).toBe(true);

    const buttons = sidebar.querySelectorAll<HTMLButtonElement>("button.shell__nav");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].getAttribute("aria-label")).toBe("Tests");
    expect(buttons[1].getAttribute("aria-label")).toBe("Dashboard");
    expect(buttons[0].querySelector("svg")).not.toBeNull();
    expect(buttons[1].querySelector("svg")).not.toBeNull();
  });

  it("marks the current item as active", () => {
    const sidebar = renderSidebar(ITEMS, "dashboard", vi.fn());
    const active = sidebar.querySelector<HTMLButtonElement>(
      "button[aria-current='page']",
    );
    expect(active?.getAttribute("aria-label")).toBe("Dashboard");
    expect(active?.classList.contains("shell__nav--active")).toBe(true);
  });

  it("navigates on click with the item id", () => {
    const onNavigate = vi.fn();
    const sidebar = renderSidebar(ITEMS, "tests", onNavigate);
    const buttons = sidebar.querySelectorAll<HTMLButtonElement>("button.shell__nav");
    buttons[1].click();
    expect(onNavigate).toHaveBeenCalledWith("dashboard");
  });
});
