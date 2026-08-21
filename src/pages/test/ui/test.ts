import "./test.css";

export function renderTest(root: HTMLElement, testId: string): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "test";

  const text = document.createElement("p");
  text.className = "test__text";
  text.textContent = testId;

  page.append(text);
  root.append(page);
}
