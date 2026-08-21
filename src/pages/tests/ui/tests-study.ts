import "./tests-study.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { fetchTestParts } from "@/entities/toeic-catalog";
import { queryClient } from "@/shared/api";
import { renderTestsTopnav } from "./tests-topnav";
import { renderTestsBotnav } from "./tests-botnav";

interface PartFileShape {
  items?: unknown[];
}

export function renderTestsStudyPage(
  root: HTMLElement,
  test: CatalogTest,
  onBack: () => void,
): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  // raw render of the first question until the real question UI lands
  const questionRaw = document.createElement("pre");
  questionRaw.className = "test__question-raw";

  page.append(renderTestsTopnav(onBack), questionRaw, renderTestsBotnav());
  root.append(page);

  // preload all part JSONs (short-lived cache), then show question 1 verbatim
  fetchTestParts(queryClient, test)
    .then((parts) => {
      const first = parts[0];
      if (!first) {
        questionRaw.textContent = "no parts found";
        return;
      }
      const part = JSON.parse(first.content) as PartFileShape;
      const question = part.items?.[0];
      if (!question) {
        questionRaw.textContent = "no questions found";
        return;
      }
      questionRaw.textContent = JSON.stringify(question, null, 2);
    })
    .catch((error) => {
      console.error(`[test] preload failed for ${test.id}:`, error);
      questionRaw.textContent = "failed to load test parts";
    });
}
