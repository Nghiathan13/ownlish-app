import { createIconButton, type IconName } from "@/shared/ui";
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

  const render = (): void => {
    const { expanded, toggle } = sidebarStore.getState();
    sidebar.replaceChildren();
    sidebar.classList.toggle("shell__sidebar--expanded", expanded);

    // toggle sits above the nav items: chevrons-right (expand) / chevrons-left (collapse)
    sidebar.append(
      createIconButton({
        icon: expanded ? "chevrons-left" : "chevrons-right",
        label: expanded ? "Collapse sidebar" : "Expand sidebar",
        variant: "ghost",
        onClick: () => {
          toggle();
          render();
        },
      }),
    );

    for (const item of items) {
      sidebar.append(
        createIconButton({
          icon: item.icon,
          label: item.label,
          text: expanded ? item.label : undefined,
          variant: "ghost",
          active: item.id === currentId,
          onClick: () => onNavigate(item.id),
        }),
      );
    }
  };

  render();
  return sidebar;
}
