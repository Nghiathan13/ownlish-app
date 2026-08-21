import "../styles/variables.css";
import "../styles/reset.css";
import "../styles/typography.css";
import "../styles/global.css";
import { catalogStore } from "@/entities/toeic-catalog";
import { createRouter } from "../routes";

const app = document.querySelector<HTMLDivElement>("#app");

// catalog is app-wide data: load once at open, before the first screen renders
async function bootstrap(): Promise<void> {
  if (!app) {
    throw new Error("#app element not found");
  }
  await catalogStore.getState().load();
  if (catalogStore.getState().status === "error") {
    app.textContent = "catalog load failed";
    return;
  }
  createRouter(app)("tests");
}

void bootstrap();
