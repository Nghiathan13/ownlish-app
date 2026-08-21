import "./dashboard.css";

export function renderDashboardPage(root: HTMLElement): void {
  root.replaceChildren();

  const page = document.createElement("div");
  page.className = "dashboard";

  const title = document.createElement("h1");
  title.className = "dashboard__title";
  title.textContent = "Dashboard";

  page.append(title);
  root.append(page);
}
