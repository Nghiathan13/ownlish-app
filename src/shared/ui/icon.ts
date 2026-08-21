import arrowLeft from "~icons/lucide/arrow-left";
import chevronLeft from "~icons/lucide/chevron-left";
import chevronRight from "~icons/lucide/chevron-right";
import fileText from "~icons/lucide/file-text";
import layoutDashboard from "~icons/lucide/layout-dashboard";

import "./icon.css";

// raw SVG strings from the lucide set (via unplugin-icons / Iconify data).
// add an icon here only when the app actually uses it — each entry is bundled.
export const ICONS = {
  "arrow-left": arrowLeft,
  "chevron-left": chevronLeft,
  "chevron-right": chevronRight,
  "file-text": fileText,
  "layout-dashboard": layoutDashboard,
} as const;

export type IconName = keyof typeof ICONS;

export function createIcon(name: IconName, size = 20): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "icon";
  span.setAttribute("aria-hidden", "true");
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  span.innerHTML = ICONS[name];
  return span;
}
