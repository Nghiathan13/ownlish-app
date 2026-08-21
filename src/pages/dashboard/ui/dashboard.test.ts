import { describe, expect, it } from "vitest";
import { renderDashboardPage } from "./dashboard";

describe("renderDashboardPage", () => {
  it("renders the dashboard title", () => {
    const root = document.createElement("div");
    renderDashboardPage(root);
    expect(root.querySelector(".dashboard__title")?.textContent).toBe("Dashboard");
  });
});
