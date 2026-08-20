import { renderCanvas } from "@/widgets/block-canvas";
import "./workspace.css";

export function renderWorkspace(root: HTMLElement): void {
  const shell = document.createElement("div");
  shell.className = "workspace";

  const title = document.createElement("h1");
  title.className = "workspace__title";
  title.textContent = "design-studio";

  shell.append(title, renderCanvas());
  root.append(shell);
}
