import { createIconButton, type IconName } from "@/shared/ui";
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
    sidebar.append(
      createIconButton({
        icon: item.icon,
        label: item.label,
        variant: "ghost",
        active: item.id === currentId,
        onClick: () => onNavigate(item.id),
      }),
    );
  }
  return sidebar;
}
