import { ChevronLeftIcon } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useI18n } from "../../i18n";
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
    <header className="shrink-0 pt-[env(safe-area-inset-top)]">
      <div className="flex h-16 items-center gap-2 px-4">
        {activePath !== "/" && (
          <Button variant="secondary" size="icon" aria-label={t.common.back} onClick={back}>
            <ChevronLeftIcon />
          </Button>
        )}
        <motion.h1 key={activePath} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate text-xl">
          {activePath === "/" ? "Perika" : match && title(match)}
        </motion.h1>
      </div>
    </header>
  );
}
