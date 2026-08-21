import { describe, expect, it, beforeEach } from "vitest";
import { sidebarStore } from "./sidebar-store";

describe("sidebarStore", () => {
  beforeEach(() => {
    sidebarStore.setState({ expanded: false });
  });

  it("starts collapsed", () => {
    expect(sidebarStore.getState().expanded).toBe(false);
  });

  it("toggles between expanded and collapsed", () => {
    sidebarStore.getState().toggle();
    expect(sidebarStore.getState().expanded).toBe(true);
    sidebarStore.getState().toggle();
    expect(sidebarStore.getState().expanded).toBe(false);
  });
});
