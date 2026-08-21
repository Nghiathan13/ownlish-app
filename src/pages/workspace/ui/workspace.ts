import "./workspace.css";

export function renderWorkspace(root: HTMLElement): void {
  const page = document.createElement("div");
  page.className = "workspace";

  const text = document.createElement("p");
  text.className = "workspace__text";
  text.textContent = "design-studio";

  page.append(text);
  root.append(page);
}
