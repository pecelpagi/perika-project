// Custom: shadcn has no bottom navigation. Built from its Button.
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { useI18n } from "../../i18n";
import { PAGE_ICONS } from "../icons";
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
    <nav aria-label={t.shell.menu} className="grid shrink-0 grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((id) => {
        const active = current === PATHS[id];
        const Icon = PAGE_ICONS[id];
        return (
          <Button
            key={id}
            variant="ghost"
            aria-current={active ? "page" : undefined}
            onClick={() => switchSection(PATHS[id])}
            className={cn(
              "h-16 min-w-0 flex-col gap-1 rounded-none px-0 text-xs",
              active ? "font-semibold text-primary hover:text-primary" : "text-muted-foreground",
            )}
          >
            {id === "record" ? (
              <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
            ) : (
              <Icon className="size-6" />
            )}
            <span className="max-w-full truncate">{t.pages[id]}</span>
          </Button>
        );
      })}
    </nav>
  );
}
