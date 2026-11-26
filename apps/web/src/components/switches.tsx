import { setLang, useI18n } from "../i18n";
import { setTheme, useTheme } from "../theme/theme";
import { Segmented } from "./page";

export function ThemeSwitch() {
  const { t } = useI18n();
  const theme = useTheme();
  return (
    <Segmented
      label={t.shell.theme}
      value={theme}
      onChange={setTheme}
      options={[
        { value: "light", label: t.shell.light },
        { value: "dark", label: t.shell.dark },
        { value: "system", label: t.shell.system },
      ]}
    />
  );
}

export function LanguageSwitch() {
  const { t, lang } = useI18n();
  return (
    <Segmented
      label={t.shell.language}
      value={lang}
      onChange={setLang}
      options={[
        { value: "en", label: "EN" },
        { value: "id", label: "ID" },
      ]}
    />
  );
}
