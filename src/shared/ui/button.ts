import { createIcon, type IconName } from "./icon";
import "./button.css";

export type ButtonVariant = "bordered" | "ghost";

export interface IconButtonConfig {
  icon: IconName;
  /** required — aria-label for icon-only buttons */
  label: string;
  variant: ButtonVariant;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function createIconButton(config: IconButtonConfig): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button button--icon button--${config.variant}`;
  if (config.active) {
    button.classList.add("button--active");
    button.setAttribute("aria-current", "page");
  }
  button.disabled = config.disabled ?? false;
  button.setAttribute("aria-label", config.label);
  button.append(createIcon(config.icon));
  button.addEventListener("click", config.onClick);
  return button;
}
