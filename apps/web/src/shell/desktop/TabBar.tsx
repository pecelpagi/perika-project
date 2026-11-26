import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useI18n } from "../../i18n";
import { Icon } from "../../ui/icons";
import { useNav } from "../nav";
import { useTabs, useTabTitle } from "../tabs-store";
import { TabMenu, type MenuAt } from "./TabMenu";

const DRAG_TYPE = "application/x-perika-tab";
const EDGE = 48;

export function TabBar() {
  const { t } = useI18n();
  const { go } = useNav();
  const { tabs, activePath, close, move } = useTabs();
  const title = useTabTitle();
  const list = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuAt | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activePath, tabs.length]);

  const reset = () => {
    setDragging(null);
    setDropAt(null);
  };

  // Insert before or after the hovered tab; never before Home.
  const position = (event: DragEvent<HTMLElement>, index: number) => {
    const box = event.currentTarget.getBoundingClientRect();
    return Math.max(1, event.clientX < box.left + box.width / 2 ? index : index + 1);
  };

  return (
    <div className="flex shrink-0 items-stretch border-b border-border bg-surface">
      <div
        ref={list}
        role="tablist"
        aria-label={t.shell.openTabs}
        className="flex min-w-0 flex-1 overflow-x-auto"
        onDragOver={(event) => {
          if (!dragging) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (event.clientX < box.left + EDGE) event.currentTarget.scrollLeft -= 12;
          else if (event.clientX > box.right - EDGE) event.currentTarget.scrollLeft += 12;
        }}
        onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget as Node | null) && setDropAt(null)}
      >
        {tabs.map((tab, index) => {
          const active = tab.path === activePath;
          const home = tab.path === "/";
          const marker =
            dropAt === index
              ? "shadow-[inset_2px_0_0_var(--accent)]"
              : dropAt === tabs.length && index === tabs.length - 1
                ? "shadow-[inset_-2px_0_0_var(--accent)]"
                : "";
          return (
            <div
              key={tab.path}
              draggable={!home}
              onDragStart={(event) => {
                event.dataTransfer.setData(DRAG_TYPE, tab.path);
                event.dataTransfer.effectAllowed = "move";
                setDragging(tab.path);
              }}
              onDragEnd={reset}
              onDragOver={(event) => {
                if (!dragging) return;
                event.preventDefault();
                setDropAt(position(event, index));
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragging) move(dragging, position(event, index));
                reset();
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                setMenu({ path: tab.path, x: event.clientX, y: event.clientY });
              }}
              className={`flex shrink-0 items-center border-b-2 transition ${
                active ? "border-accent bg-bg font-medium" : "border-transparent text-muted hover:bg-text/5"
              } ${dragging === tab.path ? "opacity-50" : ""} ${marker}`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => go(tab.path)}
                onAuxClick={(event) => event.button === 1 && close(tab.path)}
                className={`min-h-11 max-w-48 truncate pl-4 text-sm ${home ? "pr-4" : "pr-1"}`}
              >
                {title(tab)}
              </button>
              {!home && (
                <button
                  type="button"
                  aria-label={t.shell.closeTab(title(tab))}
                  onClick={() => close(tab.path)}
                  className="mr-1 grid size-8 place-items-center rounded-md hover:bg-text/10"
                >
                  <Icon name="close" className="size-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        aria-label={t.shell.tabMenu}
        aria-haspopup="menu"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          setMenu(menu ? null : { path: activePath, x: box.right, y: box.bottom });
        }}
        className="grid w-12 shrink-0 place-items-center border-l border-border hover:bg-text/5"
      >
        <Icon name="more" />
      </button>
      {menu && <TabMenu at={menu} onDone={closeMenu} />}
    </div>
  );
}
