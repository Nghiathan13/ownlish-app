import "./tests-options.css";
import { createIcon, ICONS } from "@/shared/ui";
import {
  OPTION_KEYS,
  isOptionKey,
  optionTextsByKey,
  type OptionKey,
  type QuestionViewData,
} from "../lib/test-options";
import { QUESTION_SLOT_COUNT } from "../lib/test-groups";

export interface QuestionSlot {
  element: HTMLElement;
  setQuestion: (data: QuestionViewData | null) => void;
}

function renderOptionSlot(): {
  element: HTMLElement;
  setOptions: (
    options: QuestionViewData["options"],
    selectedKey?: OptionKey | null,
  ) => void;
} {
  const list = document.createElement("ul");
  list.className = "test__options";

  let selected: OptionKey | null = null;
  const rows = {} as Record<OptionKey, HTMLElement>;
  const icons = {} as Record<OptionKey, HTMLSpanElement>;
  const texts = {} as Record<OptionKey, HTMLElement>;

  function setSelected(key: OptionKey | null): void {
    selected = key;
    for (const k of OPTION_KEYS) {
      const isSelected = k === key;
      rows[k].classList.toggle("test__option--selected", isSelected);
      rows[k].setAttribute("aria-selected", String(isSelected));
      icons[k].innerHTML = isSelected ? ICONS["circle-dot"] : ICONS.circle;
    }
  }

  for (const key of OPTION_KEYS) {
    const row = document.createElement("li");
    row.className = "test__option";
    row.dataset.key = key;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-selected", "false");
    row.hidden = true;

    const icon = createIcon("circle", 18);
    icon.classList.add("test__option-icon");

    const content = document.createElement("span");
    content.className = "test__option-content";

    const label = document.createElement("span");
    label.className = "test__option-key";
    label.textContent = `${key}.`;

    const text = document.createElement("span");
    text.className = "test__option-text";

    content.append(label, " ", text);
    row.append(icon, content);

    row.addEventListener("click", () => {
      setSelected(key);
    });

    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSelected(key);
      }
    });

    list.append(row);
    rows[key] = row;
    icons[key] = icon;
    texts[key] = text;
  }

  return {
    element: list,
    setOptions(options, selectedKey = null) {
      setSelected(selectedKey);
      const byKey = optionTextsByKey(options);
      const present = new Set<OptionKey>();
      if (options) {
        for (const option of options) {
          if (isOptionKey(option.key)) present.add(option.key);
        }
      }
      for (const key of OPTION_KEYS) {
        texts[key].textContent = byKey[key];
        rows[key].hidden = !present.has(key);
      }
    },
  };
}

function renderQuestionSlot(): QuestionSlot {
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

  const options = renderOptionSlot();
  element.append(prompt, options.element);

  return {
    element,
    setQuestion(data) {
      if (!data) {
        element.hidden = true;
        number.textContent = "";
        stem.textContent = "";
        stem.hidden = true;
        options.setOptions(null, null);
        return;
      }
      element.hidden = false;
      number.textContent = data.label;
      stem.textContent = data.stem;
      stem.hidden = data.stem === "";
      options.setOptions(data.options, data.selected ?? null);
    },
  };
}

export interface TestsOptions {
  elements: HTMLElement[];
  setQuestions: (questions: readonly QuestionViewData[]) => void;
}

/** Pre-rendered question slots. `setQuestions` writes prompts and options
 *  into cached slots — no DOM query or node create on navigation. */
export function renderTestsOptions(): TestsOptions {
  const slots = Array.from({ length: QUESTION_SLOT_COUNT }, renderQuestionSlot);

  return {
    elements: slots.map((slot) => slot.element),
    setQuestions(questions) {
      for (let i = 0; i < slots.length; i += 1) {
        const question = questions[i] ?? null;
        slots[i].setQuestion(question);
      }
    },
  };
}
