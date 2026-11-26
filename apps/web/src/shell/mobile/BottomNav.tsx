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

  // A floating pill in its own row, so it never covers page content or a sticky input.
  return (
    <div className="flex shrink-0 justify-center pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav aria-label={t.shell.menu} className="flex gap-1.5 rounded-full bg-inverse p-2 shadow-float min-[360px]:gap-2">
        {ITEMS.map((id) => {
          const active = current === PATHS[id];
          const Icon = PAGE_ICONS[id];
          return (
            <Button
              key={id}
              variant="ghost"
              aria-label={t.pages[id]}
              aria-current={active ? "page" : undefined}
              onClick={() => switchSection(PATHS[id])}
              className={cn(
                "size-14 px-0",
                active
                  ? "bg-brand text-brand-foreground hover:bg-brand"
                  : "bg-inverse-muted text-inverse-foreground hover:bg-inverse-muted",
              )}
            >
              <Icon />
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
