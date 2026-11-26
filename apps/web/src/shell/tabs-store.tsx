import { useRouter } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { data } from "../data/store";
import { readItem, writeItem } from "../lib/storage";
import { usePath } from "./nav";
import { matchPage } from "./pages";
import { closeAll, closeOthers, closeTab, moveTab, openTab, restoreTabs, type Tab } from "./tabs";

export const TABS_KEY = "perika.tabs";

type TabsApi = {
  tabs: Tab[];
  activePath: string;
  close: (path: string) => void;
  /** Removes a tab without navigating; the caller moves the URL. */
  drop: (path: string) => void;
  closeOthers: (path: string) => void;
  closeAll: () => void;
  move: (path: string, index: number) => void;
};

const TabsContext = createContext<TabsApi | null>(null);

export function useTabs() {
  const api = useContext(TabsContext);
  if (!api) throw new Error("useTabs needs TabsProvider");
  return api;
}

export function TabsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const activePath = usePath();
  const [tabs, setTabs] = useState(() => restoreTabs(readItem("session", TABS_KEY)));

  // Runs only when the URL changes, so closing the active tab does not reopen it.
  useLayoutEffect(() => {
    const match = matchPage(activePath);
    if (match) setTabs((list) => openTab(list, match));
    else router.history.replace("/");
  }, [activePath, router]);

  useEffect(() => {
    writeItem("session", TABS_KEY, JSON.stringify(tabs.map((t) => t.path)));
  }, [tabs]);

  const show = (path: string) => {
    if (path !== activePath) router.history.replace(path);
  };

  const api: TabsApi = {
    tabs,
    activePath,
    close(path) {
      const result = closeTab(tabs, path);
      setTabs(result.tabs);
      if (path === activePath) show(result.next);
    },
    drop: (path) => setTabs((list) => closeTab(list, path).tabs),
    closeOthers(path) {
      const rest = closeOthers(tabs, path);
      setTabs(rest);
      if (!rest.some((t) => t.path === activePath)) show(path);
    },
    closeAll() {
      setTabs(closeAll(tabs));
      show("/");
    },
    move: (path, index) => setTabs((list) => moveTab(list, path, index)),
  };

  return <TabsContext value={api}>{children}</TabsContext>;
}

/** Titles are computed at render, so they follow the language. */
export function useTabTitle() {
  const { t } = useI18n();
  const { txns } = data.use();
  return (tab: Tab) =>
    tab.pageId === "transaction" ? (txns.find((x) => x.id === tab.params.id)?.note ?? t.pages.transaction) : t.pages[tab.pageId];
}
