import { useI18n } from "../../i18n";
import { useTabs } from "../tabs-store";

/** Menu entries shared by the tab context menu and the tab actions dropdown. */
export function useTabActions(path: string) {
  const { t } = useI18n();
  const { tabs, close, closeOthers, closeAll } = useTabs();
  return [
    { label: t.shell.close, disabled: path === "/", run: () => close(path) },
    { label: t.shell.closeOthers, disabled: tabs.every((x) => x.path === "/" || x.path === path), run: () => closeOthers(path) },
    { label: t.shell.closeAll, disabled: tabs.length === 1, run: closeAll },
  ];
}
