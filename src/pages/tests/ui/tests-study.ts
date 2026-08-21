import "./tests-study.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { fetchTestParts } from "@/entities/toeic-catalog";
import { queryClient } from "@/shared/api";
import { renderTestsNavbar } from "./tests-navbar";

export function renderTestsStudyPage(
  root: HTMLElement,
  test: CatalogTest,
  onBack: () => void,
): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  // raw render of the first part file until the real part UI lands
  const part1 = document.createElement("pre");
  part1.className = "test__part-raw";

  page.append(renderTestsNavbar(onBack), part1);
  root.append(page);

  // cached preload: fresh entries (5 min) skip the fs read
  fetchTestParts(queryClient, test)
    .then((parts) => {
      const first = parts[0];
      if (!first) {
        part1.textContent = "no parts found";
        return;
      }
      part1.textContent = first.content;
    })
    .catch((error) => {
      console.error(`[test] preload failed for ${test.id}:`, error);
      part1.textContent = "failed to load test parts";
    });
}
