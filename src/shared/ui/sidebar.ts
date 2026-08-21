import { createIcon, type IconName } from "./icon";
import "./sidebar.css";

export interface SidebarItem {
  id: string;
  label: string;
  icon: IconName;
}

export function renderSidebar(
  items: SidebarItem[],
  currentId: string,
  onNavigate: (id: string) => void,
): HTMLElement {
  const sidebar = document.createElement("nav");
  sidebar.className = "shell__sidebar";

  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "shell__nav";
    button.setAttribute("aria-label", item.label);
    button.append(createIcon(item.icon));
    if (item.id === currentId) {
      button.classList.add("shell__nav--active");
      button.setAttribute("aria-current", "page");
    }
    button.addEventListener("click", () => onNavigate(item.id));
    sidebar.append(button);
  }
  return sidebar;
}
