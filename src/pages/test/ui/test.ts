import "./test.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { loadTestParts } from "@/entities/toeic-catalog";

export function renderTestPage(root: HTMLElement, test: CatalogTest): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  const text = document.createElement("p");
  text.className = "test__text";
  text.textContent = test.id;

  page.append(text);
  root.append(page);

  // preload part JSONs in parallel (not rendered yet)
  loadTestParts(test)
    .then((parts) => {
      const withContent = parts.filter(
        (part) => part.content.trim() !== "",
      ).length;
      console.log(
        `[test] ${test.id}: ${parts.length} part files loaded, ${withContent} with content`,
      );
    })
    .catch((error) => {
      console.error(`[test] preload failed for ${test.id}:`, error);
    });
}
