import { createIconButton } from "@/shared/ui";
import "./tests-topnav.css";

export function renderTestsTopnav(onBack: () => void): HTMLElement {
  const topnav = document.createElement("nav");
  topnav.className = "test__topnav";

  topnav.append(
    createIconButton({
      icon: "arrow-left",
      label: "Back",
      variant: "bordered",
      onClick: onBack,
    }),
  );
  return topnav;
}
