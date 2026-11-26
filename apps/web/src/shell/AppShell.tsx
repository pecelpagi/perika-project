import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { Sidebar } from "./desktop/Sidebar";
import { TabBar } from "./desktop/TabBar";
import { AppHeader } from "./mobile/AppHeader";
import { BottomNav } from "./mobile/BottomNav";
import { matchPage } from "./pages";
import { TabPanels } from "./TabPanels";
import { Toasts } from "./Toasts";
import { TabsProvider, useTabs, useTabTitle } from "./tabs-store";

function Layout() {
  const desktop = useIsDesktop();
  const { activePath } = useTabs();
  const title = useTabTitle();
  const match = matchPage(activePath);
  const pageTitle = match ? title(match) : "";

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · Perika` : "Perika";
  }, [pageTitle]);

  // Only the chrome swaps between layouts. TabPanels keeps its tree position, so nothing remounts.
  return (
    <div className="flex h-dvh overflow-hidden">
      {desktop && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        {desktop ? <TabBar /> : <AppHeader />}
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <TabPanels />
        </main>
        {!desktop && <BottomNav />}
      </div>
      <Toasts />
    </div>
  );
}

export function AppShell() {
  const router = useRouter();

  // A reload drops any open sheet, together with its history entry.
  const checked = useRef(false);
  useEffect(() => {
    if (checked.current) return; // Strict Mode runs effects twice; go back only once.
    checked.current = true;
    if ((router.history.location.state as { sheet?: string }).sheet) router.history.back();
  }, [router]);

  return (
    <TabsProvider>
      <Layout />
    </TabsProvider>
  );
}
