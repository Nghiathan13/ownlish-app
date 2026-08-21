import { beforeEach, describe, expect, it, vi } from "vitest";
import { sidebarStore } from "../model/sidebar-store";
import { renderSidebar, type SidebarItem } from "./sidebar";

const ITEMS: SidebarItem[] = [
  { id: "tests", label: "Tests", icon: "file-text" },
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
];

beforeEach(() => {
  sidebarStore.setState({ expanded: false });
});

describe("renderSidebar", () => {
  it("renders a toggle button above the nav buttons (collapsed rail)", () => {
    const sidebar = renderSidebar(ITEMS, "tests", vi.fn());
    expect(sidebar.tagName).toBe("NAV");
    expect(sidebar.classList.contains("shell__sidebar")).toBe(true);
    expect(sidebar.classList.contains("shell__sidebar--expanded")).toBe(false);

    const buttons = sidebar.querySelectorAll<HTMLButtonElement>("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute("aria-label")).toBe("Expand sidebar");
    expect(buttons[1].getAttribute("aria-label")).toBe("Tests");
    expect(buttons[2].getAttribute("aria-label")).toBe("Dashboard");
  });

  it("expands on toggle: labels visible and toggle label flips", () => {
    const sidebar = renderSidebar(ITEMS, "tests", vi.fn());
    const toggle = sidebar.querySelector<HTMLButtonElement>(
      'button[aria-label="Expand sidebar"]',
    );
    toggle?.click();

    expect(sidebar.classList.contains("shell__sidebar--expanded")).toBe(true);
    expect(
      sidebar.querySelector('button[aria-label="Collapse sidebar"]'),
    ).not.toBeNull();
    const testsButton = sidebar.querySelector<HTMLButtonElement>(
      'button[aria-label="Tests"]',
    );
    expect(testsButton?.querySelector(".button__label")?.textContent).toBe(
      "Tests",
    );
  });

  it("collapses back on second toggle", () => {
    const sidebar = renderSidebar(ITEMS, "tests", vi.fn());
    const toggle = sidebar.querySelector<HTMLButtonElement>(
      'button[aria-label="Expand sidebar"]',
    );
    toggle?.click();
    sidebar
      .querySelector<HTMLButtonElement>('button[aria-label="Collapse sidebar"]')
      ?.click();

    expect(sidebar.classList.contains("shell__sidebar--expanded")).toBe(false);
    expect(
      sidebar.querySelector('button[aria-label="Expand sidebar"]'),
    ).not.toBeNull();
  });

  it("marks the current item as active", () => {
    const sidebar = renderSidebar(ITEMS, "dashboard", vi.fn());
    const active = sidebar.querySelector<HTMLButtonElement>(
      "button[aria-current='page']",
    );
    expect(active?.getAttribute("aria-label")).toBe("Dashboard");
    expect(active?.classList.contains("button--active")).toBe(true);
  });

  it("navigates on click with the item id", () => {
    const onNavigate = vi.fn();
    const sidebar = renderSidebar(ITEMS, "tests", onNavigate);
    const buttons = sidebar.querySelectorAll<HTMLButtonElement>("button");
    buttons[2].click();
    expect(onNavigate).toHaveBeenCalledWith("dashboard");
  });
});
