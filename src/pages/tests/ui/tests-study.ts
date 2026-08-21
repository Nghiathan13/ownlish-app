import "./tests-study.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import { fetchTestParts } from "@/entities/toeic-catalog";
import { queryClient } from "@/shared/api";
import { renderTestsTopnav } from "./tests-topnav";
import { renderTestsBotnav } from "./tests-botnav";
import { renderTestsOptions } from "./tests-options";
import { unitsFromParts } from "../lib/study";
import { EMPTY_OPTIONS, readItemOptions, readItemStem } from "../lib/test-options";
import {
  DOCUMENT_SLOT_COUNT,
  QUESTION_SLOT_COUNT,
  groupDocuments,
  groupQuestionContent,
  groupQuestionNumbers,
  isGroupUnit,
} from "../lib/test-groups";
import {
  PART5_START_INDEX,
  buildTestNavigation,
  nextIndex,
  numberLabel,
  prevIndex,
  questionNumberLabel,
} from "../lib/test-navigation";

function renderQuestionSlot(): {
  element: HTMLElement;
  setPrompt: (label: string | null, stem?: string) => void;
  setOptions: ReturnType<typeof renderTestsOptions>["setOptions"];
} {
  const element = document.createElement("div");
  element.className = "test__question";
  element.hidden = true;

  const prompt = document.createElement("p");
  prompt.className = "test__prompt";

  const number = document.createElement("span");
  number.className = "test__question-number";

  const stem = document.createElement("span");
  stem.className = "test__question-text";
  stem.hidden = true;

  prompt.append(number, stem);

  const options = renderTestsOptions();
  element.append(prompt, options.element);

  return {
    element,
    setPrompt(label, text = "") {
      if (label === null) {
        element.hidden = true;
        number.textContent = "";
        stem.textContent = "";
        stem.hidden = true;
        options.setOptions(null);
        return;
      }
      element.hidden = false;
      number.textContent = label;
      stem.textContent = text;
      stem.hidden = text === "";
    },
    setOptions: options.setOptions,
  };
}

function renderDocumentSlot(): {
  element: HTMLElement;
  setDocument: (kind: string, content: string) => void;
} {
  const element = document.createElement("div");
  element.className = "test__document";
  element.hidden = true;

  const kind = document.createElement("p");
  kind.className = "test__kind";
  kind.hidden = true;

  const content = document.createElement("p");
  content.className = "test__transcript";
  content.hidden = true;

  element.append(kind, content);

  return {
    element,
    setDocument(kindText, contentText) {
      if (kindText === "" && contentText === "") {
        element.hidden = true;
        kind.textContent = "";
        kind.hidden = true;
        content.textContent = "";
        content.hidden = true;
        return;
      }
      element.hidden = false;
      kind.textContent = kindText;
      kind.hidden = kindText === "";
      content.textContent = contentText;
      content.hidden = contentText === "";
    },
  };
}

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

  const documents = Array.from(
    { length: DOCUMENT_SLOT_COUNT },
    renderDocumentSlot,
  );
  const slots = Array.from({ length: QUESTION_SLOT_COUNT }, renderQuestionSlot);
  body.append(
    status,
    ...documents.map((document) => document.element),
    ...slots.map((slot) => slot.element),
  );

  function hideDocuments(): void {
    for (const document of documents) document.setDocument("", "");
  }

  function hideSlots(): void {
    for (const slot of slots) slot.setPrompt(null);
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
    if (isGroupUnit(unit)) {
      const numbers = groupQuestionNumbers(state.index, unit);
      const contents = groupQuestionContent(unit, numbers);
      const headers = groupDocuments(unit);
      for (let i = 0; i < documents.length; i += 1) {
        const header = headers[i];
        documents[i].setDocument(header?.kind ?? "", header?.content ?? "");
      }
      for (let i = 0; i < slots.length; i += 1) {
        const number = numbers[i];
        if (number === undefined) {
          slots[i].setPrompt(null);
          continue;
        }
        slots[i].setPrompt(numberLabel(number), contents[i].stem);
        slots[i].setOptions(contents[i].options ?? EMPTY_OPTIONS);
      }
    } else {
      hideDocuments();
      slots[0].setPrompt(
        questionNumberLabel(state.index),
        state.index >= PART5_START_INDEX ? readItemStem(unit) : "",
      );
      slots[0].setOptions(readItemOptions(unit));
      for (let i = 1; i < slots.length; i += 1) slots[i].setPrompt(null);
    }
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
