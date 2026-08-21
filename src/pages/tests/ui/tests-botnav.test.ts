import { describe, expect, it } from "vitest";
import { renderTestsBotnav } from "./tests-botnav";

describe("renderTestsBotnav", () => {
  it("renders a nav with the placeholder text", () => {
    const botnav = renderTestsBotnav();
    expect(botnav.tagName).toBe("NAV");
    expect(botnav.classList.contains("test__botnav")).toBe(true);
    expect(botnav.textContent).toBe("botnav");
  });
});
