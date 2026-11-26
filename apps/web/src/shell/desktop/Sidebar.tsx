import { LogOutIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { LanguageSwitch, ThemeSwitch } from "@/components/switches";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { readSession, useLogOut } from "../../auth/session";
import { useI18n } from "../../i18n";
import { PAGE_ICONS } from "../icons";
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
    <SidebarProvider className="min-h-0 w-auto shrink-0" style={{ "--sidebar-width": "15rem" } as CSSProperties}>
      <SidebarRoot collapsible="none" className="border-r">
        <SidebarHeader>
          <p className="px-2 pt-2 text-xl font-semibold">Perika</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <nav aria-label={t.shell.menu}>
              <SidebarMenu className="gap-1">
                {MENU.map((id) => {
                  const active = activePath === PATHS[id];
                  const Icon = PAGE_ICONS[id];
                  return (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        type="button"
                        isActive={active}
                        aria-current={active ? "page" : undefined}
                        onClick={() => go(PATHS[id])}
                        className="h-10"
                      >
                        <Icon />
                        <span>{t.pages[id]}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="items-start border-t">
          <ThemeSwitch />
          <LanguageSwitch />
          <p className="w-full truncate px-2 text-xs text-muted-foreground">{readSession()?.email}</p>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="button" onClick={logOut} className="h-10">
                <LogOutIcon />
                <span>{t.shell.logOut}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarRoot>
    </SidebarProvider>
  );
}
