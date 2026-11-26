import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n";
import { useTabs } from "../tabs-store";

export type MenuAt = { path: string; x: number; y: number };

export function TabMenu({ at, onDone }: { at: MenuAt; onDone: () => void }) {
  const { t } = useI18n();
  const { tabs, close, closeOthers, closeAll } = useTabs();
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(at.x);

  useLayoutEffect(() => {
    const width = ref.current?.offsetWidth ?? 0;
    setLeft(Math.max(8, Math.min(at.x, window.innerWidth - width - 8)));
    ref.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [at]);

  useEffect(() => {
    const outside = (event: Event) => !ref.current?.contains(event.target as Node) && onDone();
    const escape = (event: KeyboardEvent) => event.key === "Escape" && onDone();
    addEventListener("pointerdown", outside);
    addEventListener("keydown", escape);
    return () => {
      removeEventListener("pointerdown", outside);
      removeEventListener("keydown", escape);
    };
  }, [onDone]);

  const items = [
    { label: t.shell.close, disabled: at.path === "/", run: () => close(at.path) },
    { label: t.shell.closeOthers, disabled: tabs.every((x) => x.path === "/" || x.path === at.path), run: () => closeOthers(at.path) },
    { label: t.shell.closeAll, disabled: tabs.length === 1, run: closeAll },
  ];

  return (
    <div ref={ref} role="menu" style={{ left, top: at.y }} className="fixed z-40 min-w-44 rounded-lg border border-border bg-surface p-1 shadow-lg">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => {
            item.run();
            onDone();
          }}
          className="block min-h-10 w-full rounded-md px-3 text-left text-sm hover:bg-text/5"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
