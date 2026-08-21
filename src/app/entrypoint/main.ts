import "../styles/variables.css";
import "../styles/reset.css";
import "../styles/typography.css";
import "../styles/global.css";
import { loadCatalog } from "@/entities/toeic-catalog";
import { renderTests } from "@/pages/tests";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("#app element not found");
}

// e2e timing kept for local observation; the automated perf gate lives in CI
// (scripts/bench-catalog.mjs) and owns the p95 baseline.
const t0 = performance.now();
loadCatalog()
  .then((catalog) => {
    const complete = catalog.tests.filter(
      (t) => t.parts.length === 7,
    ).length;
    console.log(
      `[catalog] ${catalog.tests.length} tests, ${complete} complete, schemaVersion ${catalog.schemaVersion}, loaded in ${(performance.now() - t0).toFixed(2)}ms`,
    );
    renderTests(app, catalog);
  })
  .catch((error) => {
    console.error("[catalog] load failed:", error);
    app.textContent = "catalog load failed";
  });
