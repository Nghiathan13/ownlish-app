import "../styles/variables.css";
import "../styles/reset.css";
import "../styles/typography.css";
import "../styles/global.css";
import { loadCatalog } from "@/entities/toeic-catalog";
import { renderTests } from "@/pages/tests";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  renderTests(app);
}

// bootstrap: load catalog before any tests feature renders (not rendered yet)
const SAMPLES_KEY = "ownlish:load-catalog-ms";

function recordSample(elapsedMs: number): void {
  const samples = JSON.parse(
    localStorage.getItem(SAMPLES_KEY) ?? "[]",
  ) as number[];
  samples.push(elapsedMs);
  if (samples.length > 50) {
    samples.shift();
  }
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));

  if (samples.length >= 5) {
    const sorted = [...samples].sort((a, b) => a - b);
    const percentile = (p: number) =>
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
    console.log(
      `[catalog] p50 ${percentile(0.5).toFixed(2)}ms, p95 ${percentile(0.95).toFixed(2)}ms (n=${samples.length})`,
    );
  }
}

const t0 = performance.now();
loadCatalog()
  .then((catalog) => {
    const elapsed = performance.now() - t0;
    const complete = catalog.tests.filter(
      (t) => t.parts.length === 7,
    ).length;
    console.log(
      `[catalog] ${catalog.tests.length} tests, ${complete} complete, schemaVersion ${catalog.schemaVersion}, loaded in ${elapsed.toFixed(2)}ms (e2e from document start)`,
    );
    recordSample(elapsed);
  })
  .catch((error) => console.error("[catalog] load failed:", error));
