import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { data, dismissToast, undoTxn } from "../data/store";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { Sidebar } from "./desktop/Sidebar";
import { TabBar } from "./desktop/TabBar";
import { AppHeader } from "./mobile/AppHeader";
import { BottomNav } from "./mobile/BottomNav";
import { matchPage } from "./pages";
import { TabPanels } from "./TabPanels";
import { TabsProvider, useTabs, useTabTitle } from "./tabs-store";

function Toast() {
  const { t } = useI18n();
  const { toast } = data.use();
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 md:bottom-6">
      {toast && (
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg bg-text py-1 pr-1 pl-4 text-sm text-bg shadow-lg">
          <span className="py-2">{t.toast[toast.key]}</span>
          <button
            type="button"
            onClick={() => (toast.undoId ? undoTxn(toast.undoId) : dismissToast())}
            className="min-h-11 rounded-md px-3 font-semibold underline"
          >
            {toast.undoId ? t.common.undo : t.common.close}
          </button>
        </div>
      )}
    </div>
  );
}

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
        <main className="relative min-h-0 flex-1">
          <TabPanels />
        </main>
        {!desktop && <BottomNav />}
      </div>
      <Toast />
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
