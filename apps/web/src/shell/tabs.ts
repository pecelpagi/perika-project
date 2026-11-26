// Pure tab list operations. Home is always first. The active tab comes from the URL.
import { matchPage, type PageMatch } from "./pages";

export type Tab = PageMatch;

const HOME: Tab = { path: "/", pageId: "home", params: {} };

export const openTab = (tabs: Tab[], tab: Tab) => (tabs.some((t) => t.path === tab.path) ? tabs : [...tabs, tab]);

/** `next` is the path to show if the closed tab was active: right neighbour, else left. */
export function closeTab(tabs: Tab[], path: string) {
  const index = tabs.findIndex((t) => t.path === path);
  if (index <= 0) return { tabs, next: path };
  const rest = tabs.filter((t) => t.path !== path);
  return { tabs: rest, next: (rest[index] ?? rest[index - 1] ?? HOME).path };
}

export const closeOthers = (tabs: Tab[], keep: string) => tabs.filter((t) => t.path === "/" || t.path === keep);

export const closeAll = (tabs: Tab[]) => closeOthers(tabs, "/");

/** `index` is the insert position in the current list. Nothing moves before Home. */
export function moveTab(tabs: Tab[], path: string, index: number) {
  const from = tabs.findIndex((t) => t.path === path);
  const moved = tabs[from];
  if (from <= 0 || !moved) return tabs;
  const to = Math.max(1, Math.min(tabs.length, index));
  const rest = tabs.filter((t) => t.path !== path);
  rest.splice(to > from ? to - 1 : to, 0, moved);
  return rest;
}

/** Rebuilds saved tabs from their paths and drops anything invalid. */
export function restoreTabs(saved: string | null): Tab[] {
  let paths: unknown;
  try {
    paths = JSON.parse(saved ?? "[]");
  } catch {
    paths = [];
  }
  if (!Array.isArray(paths)) return [HOME];
  return paths.reduce<Tab[]>(
    (tabs, path) => {
      const match = typeof path === "string" ? matchPage(path) : null;
      return match ? openTab(tabs, match) : tabs;
    },
    [HOME],
  );
}
