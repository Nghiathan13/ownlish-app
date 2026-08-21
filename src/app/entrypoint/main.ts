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
loadCatalog()
  .then((catalog) => {
    const complete = catalog.tests.filter(
      (t) => t.parts.length === 7,
    ).length;
    console.log(
      `[catalog] ${catalog.tests.length} tests, ${complete} complete, schemaVersion ${catalog.schemaVersion}`,
    );
  })
  .catch((error) => console.error("[catalog] load failed:", error));
