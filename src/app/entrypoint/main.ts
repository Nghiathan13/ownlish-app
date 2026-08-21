import "../styles/variables.css";
import "../styles/reset.css";
import "../styles/typography.css";
import "../styles/global.css";
import { renderWorkspace } from "@/pages/workspace";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  renderWorkspace(app);
}
