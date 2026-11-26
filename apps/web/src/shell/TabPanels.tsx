import { animate } from "motion/react";
import { Activity, useLayoutEffect, useRef, type ComponentType, type ReactNode } from "react";
import { Budget } from "../screens/Budget";
import { Coach } from "../screens/Coach";
import { Freedom } from "../screens/Freedom";
import { Gold } from "../screens/Gold";
import { Home } from "../screens/Home";
import { More } from "../screens/More";
import { RecordScreen } from "../screens/Record";
import { TransactionDetail } from "../screens/TransactionDetail";
import { Transactions } from "../screens/Transactions";
import type { PageId, PageMatch } from "./pages";
import { useTabs } from "./tabs-store";

// Screens get params as props: a hidden screen must not read the active URL.
export type ScreenProps = { path: string; params: PageMatch["params"] };

const SCREENS: Record<PageId, ComponentType<ScreenProps>> = {
  home: Home,
  record: RecordScreen,
  transactions: Transactions,
  transaction: TransactionDetail,
  budget: Budget,
  gold: Gold,
  freedom: Freedom,
  coach: Coach,
  more: More,
};

function Panel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);

  // <Activity> re-runs this each time the panel is shown.
  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    panel.scrollTop = scrollTop.current;
    // Page switch fade. Animating the panel itself never remounts the screen.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = animate(panel, { opacity: [0, 1], y: [8, 0] }, { duration: 0.18, ease: "easeOut" });
    return () => animation.complete();
  }, []);

  return (
    <div
      ref={ref}
      data-panel
      onScroll={(event) => (scrollTop.current = event.currentTarget.scrollTop)}
      className="absolute inset-0 overflow-x-hidden overflow-y-auto"
    >
      {children}
    </div>
  );
}

export function TabPanels() {
  const { tabs, activePath } = useTabs();
  // Fixed order: reordering tabs must not move panel DOM, which would reset scroll.
  const ordered = [...tabs].sort((a, b) => a.path.localeCompare(b.path));

  return ordered.map((tab) => {
    const Screen = SCREENS[tab.pageId];
    return (
      <Activity key={tab.path} mode={tab.path === activePath ? "visible" : "hidden"}>
        <Panel>
          <Screen path={tab.path} params={tab.params} />
        </Panel>
      </Activity>
    );
  });
}
