import "./tests-study.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { fetchTestParts } from "@/entities/toeic-catalog";
import { queryClient } from "@/shared/api";
import { renderTestsTopnav } from "./tests-topnav";
import { renderTestsBotnav } from "./tests-botnav";
import { parseQuestions } from "../lib/study";

export function renderTestsStudyPage(
  root: HTMLElement,
  test: CatalogTest,
  onBack: () => void,
): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  // raw render of the current question until the real question UI lands
  const questionRaw = document.createElement("pre");
  questionRaw.className = "test__question-raw";

  const state = { questions: [] as unknown[], index: 0 };

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
    const question = state.questions[state.index];
    questionRaw.textContent = question
      ? JSON.stringify(question, null, 2)
      : "";
    botnav.setNavigation(
      state.index > 0,
      state.index < state.questions.length - 1,
    );
  }

  page.append(renderTestsTopnav(onBack), questionRaw, botnav.element);
  root.append(page);

  // preload all part JSONs (short-lived cache), then show question 1 verbatim
  fetchTestParts(queryClient, test)
    .then((parts) => {
      const first = parts[0];
      if (!first) {
        questionRaw.textContent = "no parts found";
        botnav.setNavigation(false, false);
        return;
      }
      state.questions = parseQuestions(first.content);
      state.index = 0;
      if (state.questions.length === 0) {
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
