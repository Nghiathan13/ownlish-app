import { createIconButton } from "@/shared/ui";
import "./tests-botnav.css";

export interface TestsBotnav {
  element: HTMLElement;
  setNavigation: (canPrev: boolean, canNext: boolean) => void;
}

export function renderTestsBotnav(nav: {
  onPrev: () => void;
  onNext: () => void;
}): TestsBotnav {
  const botnav = document.createElement("nav");
  botnav.className = "test__botnav";

  const prev = createIconButton({
    icon: "chevron-left",
    label: "Previous question",
    variant: "ghost",
    disabled: true,
    onClick: nav.onPrev,
  });
  const next = createIconButton({
    icon: "chevron-right",
    label: "Next question",
    variant: "ghost",
    disabled: true,
    onClick: nav.onNext,
  });

  botnav.append(prev, next);

  return {
    element: botnav,
    setNavigation: (canPrev, canNext) => {
      prev.disabled = !canPrev;
      next.disabled = !canNext;
    },
  };
}
