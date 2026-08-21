import { createIcon, createIconButton, type IconName } from "@/shared/ui";
import { sidebarStore } from "../model/sidebar-store";
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

  const toggleButton = createIconButton({
    icon: "panel-left-open",
    label: "Expand sidebar",
    variant: "ghost",
    onClick: () => {
      sidebarStore.getState().toggle();
      update();
    },
  });
  toggleButton.classList.add("shell__sidebar-toggle");

  const navButtons = items.map((item) => ({
    item,
    button: createIconButton({
      icon: item.icon,
      label: item.label,
      variant: "ghost",
      active: item.id === currentId,
      onClick: () => onNavigate(item.id),
    }),
  }));

  const update = (): void => {
    const { expanded } = sidebarStore.getState();
    sidebar.classList.toggle("shell__sidebar--expanded", expanded);

    toggleButton.setAttribute(
      "aria-label",
      expanded ? "Collapse sidebar" : "Expand sidebar",
    );
    toggleButton
      .querySelector(".icon")
      ?.replaceWith(createIcon(expanded ? "panel-left-close" : "panel-left-open"));

    for (const { item, button } of navButtons) {
      const label = button.querySelector(".button__label");
      if (expanded && !label) {
        const text = document.createElement("span");
        text.className = "button__label";
        text.textContent = item.label;
        button.append(text);
      } else if (!expanded) {
        label?.remove();
      }
    }
  };

  sidebar.append(toggleButton, ...navButtons.map(({ button }) => button));
  update();
  return sidebar;
}
