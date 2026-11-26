import { useRouter, useRouterState } from "@tanstack/react-router";
import { normalizePath } from "./pages";

type HistoryExtra = { fromHome?: boolean; sheet?: string };

export const usePath = () => useRouterState({ select: (s) => normalizePath(s.location.pathname) });

export function useNav() {
  const router = useRouter();
  const history = router.history;
  const current = () => normalizePath(history.location.pathname);
  const extra = () => history.location.state as HistoryExtra;

  return {
    /** In-page links and desktop navigation. */
    go(path: string) {
      if (path !== current()) history.push(path, { fromHome: current() === "/" });
    },
    /** Bottom navigation: Home to a section pushes, section to section replaces, so Back returns Home. */
    switchSection(path: string) {
      if (path === current()) return;
      if (current() === "/") history.push(path, { fromHome: true });
      else if (path !== "/") history.replace(path, { fromHome: extra().fromHome });
      else if (extra().fromHome) history.back();
      else history.replace(path);
    },
    back() {
      if (history.canGoBack()) history.back();
      else history.replace("/");
    },
  };
}

/** A sheet or dialog that owns a history entry, so browser Back closes it. */
export function useSheet(id: string) {
  const router = useRouter();
  const history = router.history;
  const open = useRouterState({ select: (s) => (s.location.state as HistoryExtra).sheet === id });
  return {
    open,
    show() {
      history.push(history.location.href, { ...history.location.state, sheet: id } as HistoryExtra);
    },
    hide() {
      if ((history.location.state as HistoryExtra).sheet === id) history.back();
    },
  };
}
