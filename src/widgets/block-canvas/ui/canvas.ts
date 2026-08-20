import "./canvas.css";

export function renderCanvas(): HTMLElement {
  const canvas = document.createElement("div");
  canvas.className = "block-canvas";
  canvas.textContent = "canvas";
  return canvas;
}
