import type { CatalogTest } from "@/entities/toeic-catalog";
import { renderTestPage } from "@/pages/test";
import { renderTestsPage } from "@/pages/tests";

export type RouteName = "tests" | "test";
export type Navigate = (route: RouteName, test?: CatalogTest) => void;

export function createRouter(root: HTMLElement): Navigate {
  const navigate: Navigate = (route, test) => {
    if (route === "test" && test) {
      renderTestPage(root, test);
    } else {
      renderTestsPage(root, (selected) => navigate("test", selected));
    }
  };
  return navigate;
}
