import type { CatalogTest } from "@/entities/toeic-catalog";
import { renderTestsOverviewPage, renderTestsStudyPage } from "@/pages/tests";
import { renderDashboardPage } from "@/pages/dashboard";
import { renderShell } from "@/shared/ui";
import { renderSidebar, type SidebarItem } from "@/widgets/sidebar";

export type RouteName = "tests" | "dashboard" | "test";
export type Navigate = (route: RouteName, test?: CatalogTest) => void;

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "tests", label: "Tests", icon: "file-text" },
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
];

export function createRouter(root: HTMLElement): Navigate {
  const navigate: Navigate = (route, test) => {
    root.replaceChildren();

    // shell re-renders on each navigation so the sidebar active state stays correct
    const current = route === "dashboard" ? "dashboard" : "tests";
    const { shell, content } = renderShell(
      renderSidebar(SIDEBAR_ITEMS, current, (id) => navigate(id as RouteName)),
    );
    root.append(shell);

    if (route === "dashboard") {
      renderDashboardPage(content);
    } else if (route === "test" && test) {
      renderTestsStudyPage(content, test, () => navigate("tests"));
    } else {
      renderTestsOverviewPage(content, (selected) => navigate("test", selected));
    }
  };
  return navigate;
}
