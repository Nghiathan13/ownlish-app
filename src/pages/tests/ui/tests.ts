import "./tests.css";
import type { Catalog } from "@/entities/toeic-catalog";

export function renderTests(root: HTMLElement, catalog: Catalog): void {
  const page = document.createElement("div");
  page.className = "tests";

  const grid = document.createElement("div");
  grid.className = "tests__grid";

  for (const test of catalog.tests) {
    const card = document.createElement("div");
    card.className = "tests__card";
    card.textContent = test.id;
    grid.append(card);
  }

  page.append(grid);
  root.append(page);
}
