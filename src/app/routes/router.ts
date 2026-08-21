import type { CatalogTest } from "@/entities/toeic-catalog";
import { renderTestsOverviewPage, renderTestsStudyPage } from "@/pages/tests";

export type RouteName = "tests" | "test";
export type Navigate = (route: RouteName, test?: CatalogTest) => void;

export function createRouter(root: HTMLElement): Navigate {
  const navigate: Navigate = (route, test) => {
    if (route === "test" && test) {
      renderTestsStudyPage(root, test);
    } else {
      renderTestsOverviewPage(root, (selected) => navigate("test", selected));
    }
  };
  return navigate;
}
