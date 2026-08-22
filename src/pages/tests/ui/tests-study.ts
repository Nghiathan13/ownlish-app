import "./tests-study.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { fetchTestParts } from "@/entities/toeic-catalog";
import { queryClient } from "@/shared/api";
import { renderTestsTopnav } from "./tests-topnav";
import { renderTestsBotnav } from "./tests-botnav";
import { renderTestsDocuments } from "./tests-documents";
import { renderTestsOptions } from "./tests-options";
import { unitsFromParts } from "../lib/study";
import { readUnitDocuments } from "../lib/test-documents";
import { readUnitQuestions } from "../lib/test-options";
import {
  buildTestNavigation,
  nextIndex,
  prevIndex,
} from "../lib/test-navigation";

export function renderTestsStudyPage(
  root: HTMLElement,
  test: CatalogTest,
  onBack: () => void,
): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  const body = document.createElement("div");
  body.className = "test__body";

  const status = document.createElement("p");
  status.className = "test__status";
  status.hidden = true;

  const paneLeft = document.createElement("div");
  paneLeft.className = "test__pane test__pane--left";

  const paneRight = document.createElement("div");
  paneRight.className = "test__pane test__pane--right";

  const documents = renderTestsDocuments();
  const options = renderTestsOptions();

  paneLeft.append(
    status,
    ...documents.elements,
  );
  paneRight.append(...options.elements);
  body.append(paneLeft, paneRight);

  function hideDocuments(): void {
    documents.setDocuments([]);
  }

  function hideSlots(): void {
    options.setQuestions([]);
  }

  function showStatus(message: string): void {
    status.hidden = false;
    status.textContent = message;
    hideDocuments();
    hideSlots();
  }

  const state = { units: [] as unknown[], index: 0 };

  const botnav = renderTestsBotnav({
    onPrev: () => {
      state.index = prevIndex(state.index);
      renderQuestion();
    },
    onNext: () => {
      state.index = nextIndex(state.index);
      renderQuestion();
    },
  });

  function applyNavigation(): void {
    const nav = buildTestNavigation(state.index, state.units.length);
    botnav.setNavigation(nav.canPrev, nav.canNext);
  }

  function renderQuestion(): void {
    status.hidden = true;
    status.textContent = "";
    const unit = state.units[state.index];
    documents.setDocuments(readUnitDocuments(unit));
    options.setQuestions(readUnitQuestions(unit, state.index));
    applyNavigation();
  }

  page.append(renderTestsTopnav(onBack), body, botnav.element);
  root.append(page);

  fetchTestParts(queryClient, test)
    .then((parts) => {
      if (parts.length === 0) {
        showStatus("no parts found");
        applyNavigation();
        return;
      }
      state.units = unitsFromParts(parts);
      state.index = 0;
      if (state.units.length === 0) {
        showStatus("no questions found");
        applyNavigation();
        return;
      }
      renderQuestion();
    })
    .catch((error) => {
      console.error(`[test] preload failed for ${test.id}:`, error);
      showStatus("failed to load test parts");
      applyNavigation();
    });
}
