import "./tests-study.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { loadTestParts } from "@/entities/toeic-catalog";

export function renderTestsStudyPage(root: HTMLElement, test: CatalogTest): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  const text = document.createElement("p");
  text.className = "test__text";
  text.textContent = test.id;

  // raw render of the first part file until the real part UI lands
  const part1 = document.createElement("pre");
  part1.className = "test__part-raw";

  page.append(text, part1);
  root.append(page);

  // preload all part JSONs, then show part 1 verbatim
  const t0 = performance.now();
  loadTestParts(test)
    .then((parts) => {
      const first = parts[0];
      if (!first) {
        part1.textContent = "no parts found";
        return;
      }
      part1.textContent = first.content;
      console.log(
        `[test] ${test.id}: ${parts.length} part files preloaded in ${(performance.now() - t0).toFixed(2)}ms`,
      );
    })
    .catch((error) => {
      console.error(`[test] preload failed for ${test.id}:`, error);
      part1.textContent = "failed to load test parts";
    });
}
