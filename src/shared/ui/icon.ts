import arrowLeft from "~icons/lucide/arrow-left";

import "./icon.css";

// raw SVG strings from the lucide set (via unplugin-icons / Iconify data).
// add an icon here only when the app actually uses it — every entry is bundled.
export const ICONS = {
  "arrow-left": arrowLeft,
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
