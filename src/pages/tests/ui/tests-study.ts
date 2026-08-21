import "./tests-study.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { fetchTestParts } from "@/entities/toeic-catalog";
import { queryClient } from "@/shared/api";
import { renderTestsTopnav } from "./tests-topnav";
import { renderTestsBotnav } from "./tests-botnav";
import { parseUnits } from "../lib/study";

export function renderTestsStudyPage(
  root: HTMLElement,
  test: CatalogTest,
  onBack: () => void,
): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  // raw render of the current unit (item or group) until the real UI lands
  const questionRaw = document.createElement("pre");
  questionRaw.className = "test__question-raw";

  const state = { units: [] as unknown[], index: 0 };

  const botnav = renderTestsBotnav({
    // buttons are disabled at the boundaries — no extra guards needed
    onPrev: () => {
      state.index -= 1;
      renderQuestion();
    },
    onNext: () => {
      state.index += 1;
      renderQuestion();
    },
  });

  function renderQuestion(): void {
    const unit = state.units[state.index];
    questionRaw.textContent = unit ? JSON.stringify(unit, null, 2) : "";
    botnav.setNavigation(
      state.index > 0,
      state.index < state.units.length - 1,
    );
  }

  page.append(renderTestsTopnav(onBack), questionRaw, botnav.element);
  root.append(page);

  // preload all part JSONs (short-lived cache), flatten their units,
  // then show the first one verbatim
  fetchTestParts(queryClient, test)
    .then((parts) => {
      if (parts.length === 0) {
        questionRaw.textContent = "no parts found";
        botnav.setNavigation(false, false);
        return;
      }
      state.units = parts.flatMap((part) => parseUnits(part.content));
      state.index = 0;
      if (state.units.length === 0) {
        questionRaw.textContent = "no questions found";
        botnav.setNavigation(false, false);
        return;
      }
      renderQuestion();
    })
    .catch((error) => {
      console.error(`[test] preload failed for ${test.id}:`, error);
      questionRaw.textContent = "failed to load test parts";
      botnav.setNavigation(false, false);
    });
}
