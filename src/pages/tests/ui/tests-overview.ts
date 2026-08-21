import "./tests-overview.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { catalogStore } from "@/entities/toeic-catalog";
import { buildTestCardViewModel } from "../lib/tests";
import { renderTestCard } from "./test-card";

export function renderTestsOverviewPage(
  root: HTMLElement,
  onSelectTest: (test: CatalogTest) => void,
): void {
  root.replaceChildren();

  const { catalog } = catalogStore.getState();
  if (!catalog) {
    return; // unreachable: bootstrap loads the catalog before routing starts
  }

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
