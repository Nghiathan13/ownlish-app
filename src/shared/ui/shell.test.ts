import { describe, expect, it } from "vitest";
import { renderShell } from "./shell";

describe("renderShell", () => {
  it("renders the given sidebar and a content main", () => {
    const sidebar = document.createElement("nav");
    sidebar.className = "shell__sidebar";
    const { shell, content } = renderShell(sidebar);

    expect(shell.classList.contains("shell")).toBe(true);
    expect(shell.querySelector("nav.shell__sidebar")).toBe(sidebar);
    expect(content.tagName).toBe("MAIN");
    expect(content.classList.contains("shell__content")).toBe(true);
  });
});
