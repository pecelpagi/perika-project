import { useLogOut, readSession } from "../../auth/session";
import { useI18n } from "../../i18n";
import { Icon } from "../../ui/icons";
import { LanguageSwitch, ThemeSwitch } from "../../ui/switches";
import { useNav } from "../nav";
import { PATHS } from "../pages";
import { useTabs } from "../tabs-store";

const MENU = ["home", "record", "transactions", "budget", "gold", "freedom", "coach"] as const;

export function Sidebar() {
  const { t } = useI18n();
  const { go } = useNav();
  const { activePath } = useTabs();
  const logOut = useLogOut();

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-surface p-3">
      <p className="px-3 pt-2 text-xl font-semibold">Perika</p>
      <nav aria-label={t.shell.menu} className="flex flex-col gap-1">
        {MENU.map((id) => {
          const active = activePath === PATHS[id];
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => go(PATHS[id])}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                active ? "bg-accent/10 font-medium text-accent" : "hover:bg-text/5"
              }`}
            >
              <Icon name={id} />
              {t.pages[id]}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-start gap-2 border-t border-border pt-3">
        <ThemeSwitch />
        <LanguageSwitch />
        <p className="w-full truncate px-1 text-xs text-muted">{readSession()?.email}</p>
        <button type="button" onClick={logOut} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm hover:bg-text/5">
          <Icon name="logout" />
          {t.shell.logOut}
        </button>
      </div>
    </aside>
  );
}
