import { useI18n } from "../../i18n";
import { Icon } from "../../ui/icons";
import { useNav } from "../nav";
import { PATHS } from "../pages";
import { useTabs } from "../tabs-store";

const ITEMS = ["home", "budget", "record", "coach", "more"] as const;

export function BottomNav() {
  const { t } = useI18n();
  const { switchSection } = useNav();
  const { activePath } = useTabs();
  const primary = ITEMS.map((id) => PATHS[id]);
  // Pages without their own item belong to "More".
  const current = primary.includes(activePath) ? activePath : PATHS.more;

  return (
    <nav aria-label={t.shell.menu} className="grid shrink-0 grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((id) => {
        const active = current === PATHS[id];
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => switchSection(PATHS[id])}
            className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-xs ${
              active ? "font-semibold text-accent" : "text-muted"
            }`}
          >
            {id === "record" ? (
              <span className="grid size-10 place-items-center rounded-full bg-accent text-on-accent">
                <Icon name={id} className="size-6" />
              </span>
            ) : (
              <Icon name={id} className="size-6" />
            )}
            <span className="max-w-full truncate">{t.pages[id]}</span>
          </button>
        );
      })}
    </nav>
  );
}
