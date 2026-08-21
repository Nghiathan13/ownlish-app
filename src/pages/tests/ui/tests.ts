import "./tests.css";

export function renderTests(root: HTMLElement): void {
  const page = document.createElement("div");
  page.className = "tests";

  const text = document.createElement("p");
  text.className = "tests__text";
  text.textContent = "tests";

  page.append(text);
  root.append(page);
}
