import "./test-card.css";
import type { CatalogTest } from "@/entities/toeic-catalog";
import type { TestCardViewModel } from "../model/tests";

export function renderTestCard(
  model: TestCardViewModel,
  test: CatalogTest,
  onSelect: (test: CatalogTest) => void,
): HTMLElement {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "tests__card";
  card.textContent = model.id;
  card.title = `${model.seriesLabel} ${model.year} · Test ${model.testNumber}${model.complete ? "" : " (incomplete)"}`;
  card.addEventListener("click", () => onSelect(test));
  return card;
}
