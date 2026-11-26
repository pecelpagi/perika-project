import { useI18n } from "../../i18n";
import { Icon } from "../../ui/icons";
import { useNav } from "../nav";
import { matchPage } from "../pages";
import { useTabs, useTabTitle } from "../tabs-store";

export function AppHeader() {
  const { t } = useI18n();
  const { back } = useNav();
  const { activePath } = useTabs();
  const title = useTabTitle();
  const match = matchPage(activePath);

  return (
    <header className="shrink-0 border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center gap-1 px-2">
        {activePath !== "/" && (
          <button type="button" aria-label={t.common.back} onClick={back} className="grid size-11 place-items-center rounded-lg hover:bg-text/5">
            <Icon name="back" />
          </button>
        )}
        <h1 className="truncate px-2 text-xl font-semibold">{activePath === "/" ? "Perika" : match && title(match)}</h1>
      </div>
    </header>
  );
}
