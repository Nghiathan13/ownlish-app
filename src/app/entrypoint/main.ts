import "../styles/variables.css";
import "../styles/reset.css";
import "../styles/typography.css";
import "../styles/global.css";
import { renderTests } from "@/pages/tests";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  renderTests(app);
}
