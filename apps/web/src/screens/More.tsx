import { LogOutIcon } from "lucide-react";
import { ListRow, RowList } from "@/components/list";
import { Page, SectionCard } from "@/components/page";
import { LanguageSwitch, ThemeSwitch } from "@/components/switches";
import { Button } from "@/components/ui/button";
import { readSession, useLogOut } from "../auth/session";
import { useI18n } from "../i18n";
import { PAGE_ICONS } from "../shell/icons";
import { useNav } from "../shell/nav";
import { PATHS } from "../shell/pages";

const LINKS = ["transactions", "gold", "freedom"] as const;

export function More() {
  const { t } = useI18n();
  const { go } = useNav();
  const logOut = useLogOut();

  return (
    <Page className="max-w-xl">
      <SectionCard className="py-0">
        <RowList>
          {LINKS.map((id) => {
            const Icon = PAGE_ICONS[id];
            return (
              <ListRow
                key={id}
                title={
                  <span className="flex items-center gap-3">
                    <Icon aria-hidden className="size-5" />
                    {t.pages[id]}
                  </span>
                }
                onClick={() => go(PATHS[id])}
              />
            );
          })}
        </RowList>
      </SectionCard>
      <SectionCard title={t.shell.theme}>
        <ThemeSwitch />
      </SectionCard>
      <SectionCard title={t.shell.language}>
        <LanguageSwitch />
      </SectionCard>
      <p className="text-sm break-words text-muted-foreground">{t.more.signedInAs(readSession()?.email ?? "")}</p>
      <Button variant="outline" size="lg" onClick={logOut}>
        <LogOutIcon />
        {t.shell.logOut}
      </Button>
    </Page>
  );
}
