import "./tests-botnav.css";

export function renderTestsBotnav(): HTMLElement {
  const botnav = document.createElement("nav");
  botnav.className = "test__botnav";

  const text = document.createElement("span");
  text.className = "test__botnav-text";
  text.textContent = "botnav";

  botnav.append(text);
  return botnav;
}
