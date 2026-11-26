import { readSession, useLogOut } from "../auth/session";
import { useI18n } from "../i18n";
import { useNav } from "../shell/nav";
import { PATHS } from "../shell/pages";
import { Button, Card, ListRow, Page } from "../ui";
import { Icon } from "../ui/icons";
import { LanguageSwitch, ThemeSwitch } from "../ui/switches";

const LINKS = ["transactions", "gold", "freedom"] as const;

export function More() {
  const { t } = useI18n();
  const { go } = useNav();
  const logOut = useLogOut();

  return (
    <Page className="max-w-xl">
      <Card className="py-0">
        <ul>
          {LINKS.map((id) => (
            <ListRow
              key={id}
              title={
                <span className="flex items-center gap-3">
                  <Icon name={id} />
                  {t.pages[id]}
                </span>
              }
              onClick={() => go(PATHS[id])}
            />
          ))}
        </ul>
      </Card>
      <Card title={t.shell.theme}>
        <ThemeSwitch />
      </Card>
      <Card title={t.shell.language}>
        <LanguageSwitch />
      </Card>
      <p className="break-words text-sm text-muted">{t.more.signedInAs(readSession()?.email ?? "")}</p>
      <Button variant="secondary" onClick={logOut}>
        <Icon name="logout" />
        {t.shell.logOut}
      </Button>
    </Page>
  );
}
