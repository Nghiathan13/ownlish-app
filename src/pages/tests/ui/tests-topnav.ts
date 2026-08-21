import { createIcon } from "@/shared/ui";
import "./tests-topnav.css";

export function renderTestsTopnav(onBack: () => void): HTMLElement {
  const topnav = document.createElement("nav");
  topnav.className = "test__topnav";

  const back = document.createElement("button");
  back.type = "button";
  back.className = "test__back";
  back.append(createIcon("arrow-left"));
  back.addEventListener("click", onBack);

  topnav.append(back);
  return topnav;
}
