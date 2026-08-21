import { createIcon } from "@/shared/ui";
import "./tests-navbar.css";

export function renderTestsNavbar(onBack: () => void): HTMLElement {
  const navbar = document.createElement("nav");
  navbar.className = "test__navbar";

  const back = document.createElement("button");
  back.type = "button";
  back.className = "test__back";
  back.append(createIcon("arrow-left"));
  back.addEventListener("click", onBack);

  navbar.append(back);
  return navbar;
}
