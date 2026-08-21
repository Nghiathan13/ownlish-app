import "./shell.css";

export interface Shell {
  shell: HTMLElement;
  content: HTMLElement;
}

export function renderShell(sidebar: HTMLElement): Shell {
  const shell = document.createElement("div");
  shell.className = "shell";

  const content = document.createElement("main");
  content.className = "shell__content";

  shell.append(sidebar, content);
  return { shell, content };
}
