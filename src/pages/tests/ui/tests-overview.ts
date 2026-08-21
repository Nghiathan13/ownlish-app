import "./tests-overview.css";
import type { Catalog, CatalogTest } from "@/entities/toeic-catalog";
import { loadCatalog } from "@/entities/toeic-catalog";
import { buildTestCardViewModel } from "../lib/tests";
import { renderTestCard } from "./test-card";

export function renderTestsOverviewPage(
  root: HTMLElement,
  onSelectTest: (test: CatalogTest) => void,
): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "tests";

  const status = document.createElement("p");
  status.className = "tests__status";
  status.textContent = "loading catalog...";
  page.append(status);
  root.append(page);

  // e2e timing kept for local observation; the automated perf gate lives in CI
  // (scripts/bench-catalog.mjs) and owns the p95 baseline.
  const t0 = performance.now();
  loadCatalog()
    .then((catalog: Catalog) => {
      const complete = catalog.tests.filter(
        (t) => t.parts.length === 7,
      ).length;
      console.log(
        `[catalog] ${catalog.tests.length} tests, ${complete} complete, schemaVersion ${catalog.schemaVersion}, loaded in ${(performance.now() - t0).toFixed(2)}ms`,
      );
      status.remove();

      const grid = document.createElement("div");
      grid.className = "tests__grid";

      for (const test of catalog.tests) {
        grid.append(renderTestCard(buildTestCardViewModel(test), test, onSelectTest));
      }

      page.append(grid);
    })
    .catch((error) => {
      console.error("[catalog] load failed:", error);
      status.textContent = "catalog load failed";
    });
}
