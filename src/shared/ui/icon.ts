import arrowLeft from "~icons/lucide/arrow-left";
import chevronLeft from "~icons/lucide/chevron-left";
import chevronRight from "~icons/lucide/chevron-right";
import circle from "~icons/lucide/circle";
import circleCheck from "~icons/lucide/circle-check";
import circleX from "~icons/lucide/circle-x";
import fileText from "~icons/lucide/file-text";
import layoutDashboard from "~icons/lucide/layout-dashboard";
import panelLeftClose from "~icons/lucide/panel-left-close";
import panelLeftOpen from "~icons/lucide/panel-left-open";

import "./icon.css";

const circleDot = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/></g></svg>`;

// raw SVG strings from the lucide set (via unplugin-icons / Iconify data).
// add an icon here only when the app actually uses it — each entry is bundled.
export const ICONS = {
  "arrow-left": arrowLeft,
  "chevron-left": chevronLeft,
  "chevron-right": chevronRight,
  circle,
  "circle-check": circleCheck,
  "circle-dot": circleDot,
  "circle-x": circleX,
  "file-text": fileText,
  "layout-dashboard": layoutDashboard,
  "panel-left-close": panelLeftClose,
  "panel-left-open": panelLeftOpen,
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
