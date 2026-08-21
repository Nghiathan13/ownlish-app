import "./tests-options.css";
import {
  OPTION_KEYS,
  isOptionKey,
  optionTextsByKey,
  type ItemOption,
  type OptionKey,
} from "../lib/test-options";

export interface TestsOptions {
  element: HTMLElement;
  setOptions: (options: readonly ItemOption[] | null) => void;
}

/** Four A–D rows created once. `setOptions` writes English text by key
 *  into the cached slots — no DOM query or node create on navigation. */
export function renderTestsOptions(): TestsOptions {
  const list = document.createElement("ul");
  list.className = "test__options";

  const rows = {} as Record<OptionKey, HTMLElement>;
  const texts = {} as Record<OptionKey, HTMLElement>;
  for (const key of OPTION_KEYS) {
    const row = document.createElement("li");
    row.className = "test__option";
    row.dataset.key = key;
    row.hidden = true;

    const label = document.createElement("span");
    label.className = "test__option-key";
    label.textContent = `${key}.`;

    const text = document.createElement("span");
    text.className = "test__option-text";

    row.append(label, text);
    list.append(row);
    rows[key] = row;
    texts[key] = text;
  }

  return {
    element: list,
    setOptions(options) {
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
