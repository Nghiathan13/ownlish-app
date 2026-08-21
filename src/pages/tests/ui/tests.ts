import "./tests.css";
import type { Catalog, CatalogTest } from "@/entities/toeic-catalog";
import { buildTestCardViewModel } from "../model/tests";
import { renderTestCard } from "./test-card";

export function renderTests(
  root: HTMLElement,
  catalog: Catalog,
  onSelectTest: (test: CatalogTest) => void,
): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "tests";

  const grid = document.createElement("div");
  grid.className = "tests__grid";

  for (const test of catalog.tests) {
    grid.append(renderTestCard(buildTestCardViewModel(test), test, onSelectTest));
  }

  page.append(grid);
  root.append(page);
}
