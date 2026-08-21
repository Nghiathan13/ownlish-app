import arrowLeft from "~icons/lucide/arrow-left";
import arrowRight from "~icons/lucide/arrow-right";
import check from "~icons/lucide/check";
import chevronRight from "~icons/lucide/chevron-right";
import menu from "~icons/lucide/menu";
import pause from "~icons/lucide/pause";
import play from "~icons/lucide/play";
import settings from "~icons/lucide/settings";
import x from "~icons/lucide/x";

import "./icon.css";

// raw SVG strings from the lucide set (via unplugin-icons / Iconify data).
// add icons here as the app needs them — tree-shaken, only imports used.
export const ICONS = {
  "arrow-left": arrowLeft,
  "arrow-right": arrowRight,
  check,
  "chevron-right": chevronRight,
  menu,
  pause,
  play,
  settings,
  x,
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
