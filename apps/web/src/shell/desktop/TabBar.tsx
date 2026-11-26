import { Accessibility, Feedback, PointerActivationConstraints } from "@dnd-kit/dom";
import { move as moveItems } from "@dnd-kit/helpers";
import { DragDropProvider, KeyboardSensor, PointerSensor, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "cn";
import { EllipsisIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type Ref } from "react";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useI18n } from "../../i18n";
import { useNav } from "../nav";
import type { Tab } from "../tabs";
import { useTabs, useTabTitle } from "../tabs-store";
import { useTabActions } from "./TabMenu";

// A drag starts only after the pointer moves (or a touch is held), so a click selects the tab.
const SENSORS = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === "touch"
        ? [new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 })]
        : [new PointerActivationConstraints.Distance({ value: 6 })],
  }),
  // Space picks a tab up; Enter stays free to select it.
  KeyboardSensor.configure({
    keyboardCodes: {
      start: ["Space"],
      cancel: ["Escape"],
      end: ["Space", "Enter", "Tab"],
      up: ["ArrowUp"],
      down: ["ArrowDown"],
      left: ["ArrowLeft"],
      right: ["ArrowRight"],
    },
  }),
];

export function TabBar() {
  const { t, lang } = useI18n();
  const { tabs, activePath, move } = useTabs();
  const title = useTabTitle();
  const reduced = useReducedMotion();
  const list = useRef<HTMLDivElement>(null);
  /** Order shown while dragging; the saved order changes only on drop. */
  const [preview, setPreview] = useState<string[]>();
  const previewRef = useRef<string[]>(undefined);

  const paths = tabs.map((tab) => tab.path);
  const shown = preview ? preview.flatMap((path) => tabs.find((tab) => tab.path === path) ?? []) : tabs;

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activePath, tabs.length, lang]);

  function show(order: string[] | undefined) {
    previewRef.current = order;
    setPreview(order);
  }

  function onDragOver(event: DragOverEvent) {
    event.preventDefault(); // React owns the order, so dnd-kit must not move DOM nodes itself.
    const next = moveItems(previewRef.current ?? paths, event);
    if (next[0] === "/") show(next);
  }

  function onDragEnd({ operation, canceled }: DragEndEvent) {
    const order = previewRef.current;
    const path = String(operation.source?.id ?? "");
    const box = list.current?.getBoundingClientRect();
    const { x, y } = operation.position.current;
    const outside =
      operation.activatorEvent instanceof PointerEvent &&
      !!box &&
      (x < box.left || x > box.right || y < box.top || y > box.bottom);
    show(undefined);
    if (canceled || outside || !order) return;
    const from = paths.indexOf(path);
    const to = order.indexOf(path);
    if (from !== to && to >= 0) move(path, to > from ? to + 1 : to);
  }

  const nameOf = (id: unknown) => {
    const tab = tabs.find((x) => x.path === id);
    return tab ? title(tab) : "";
  };

  return (
    <div className="flex shrink-0 items-center gap-1 border-b bg-card pr-1">
      {/* dnd-kit reads its screen reader text once, so a language change needs a new provider. */}
      <DragDropProvider
        key={lang}
        sensors={SENSORS}
        plugins={(defaults) => [
          ...defaults,
          Feedback.configure({ dropAnimation: reduced ? null : { duration: 200, easing: "ease-out" } }),
          Accessibility.configure({
            screenReaderInstructions: { draggable: t.shell.dragHelp },
            announcements: {
              dragstart: ({ operation }: DragStartEvent) => t.shell.dragStart(nameOf(operation.source?.id)),
              dragover: ({ operation }: DragOverEvent) => {
                const id = String(operation.source?.id);
                return t.shell.dragOver(nameOf(id), (previewRef.current ?? paths).indexOf(id) + 1);
              },
              dragend: ({ operation, canceled }: DragEndEvent) =>
                (canceled ? t.shell.dragCancel : t.shell.dragDrop)(nameOf(operation.source?.id)),
            },
          }),
        ]}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <motion.div
          ref={list}
          layoutScroll
          role="tablist"
          aria-label={t.shell.openTabs}
          className="relative flex min-w-0 flex-1 gap-1 overflow-x-auto p-1"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((tab, index) => (
              <TabItem
                key={tab.path}
                tab={tab}
                index={index}
                // Neighbours slide only when tabs are added or removed; dnd-kit animates reordering.
                layoutKey={[...paths].sort().join()}
                reduced={!!reduced}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </DragDropProvider>
      <TabActionsButton />
    </div>
  );
}

function TabItem({
  ref,
  tab,
  index,
  layoutKey,
  reduced,
}: {
  ref?: Ref<HTMLDivElement>;
  tab: Tab;
  index: number;
  layoutKey: string;
  reduced: boolean;
}) {
  const { t } = useI18n();
  const { go } = useNav();
  const { activePath, close } = useTabs();
  const name = useTabTitle()(tab);
  const actions = useTabActions(tab.path);
  const active = tab.path === activePath;
  const home = tab.path === "/";
  const sortable = useSortable({
    id: tab.path,
    index,
    disabled: home, // Home stays first: it cannot be dragged or dropped on.
    transition: reduced ? null : { duration: 200, easing: "ease-out" },
  });

  return (
    <motion.div
      ref={ref}
      layout="position"
      layoutDependency={layoutKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="shrink-0"
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={sortable.ref}
            className={cn(
              "flex items-center rounded-lg transition-[background-color,box-shadow,scale]",
              active ? "bg-sidebar-accent text-primary" : "text-muted-foreground hover:bg-muted",
              sortable.isDragSource && "scale-105 bg-popover shadow-lg",
            )}
          >
            <Button
              ref={sortable.handleRef}
              variant="ghost"
              size="lg"
              role="tab"
              aria-selected={active}
              onClick={() => go(tab.path)}
              onAuxClick={(event) => event.button === 1 && close(tab.path)}
              className={cn("h-9 max-w-48 pl-3 hover:bg-transparent hover:text-current dark:hover:bg-transparent", home ? "pr-3" : "pr-1")}
            >
              <span className="truncate">{name}</span>
            </Button>
            {!home && (
              <CloseButton label={t.shell.closeTab(name)} onClick={() => close(tab.path)} />
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-44">
          {actions.map((item) => (
            <ContextMenuItem key={item.label} disabled={item.disabled} onSelect={item.run}>
              {item.label}
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    </motion.div>
  );
}

function CloseButton({ label, ...props }: { label: string } & ComponentProps<typeof Button>) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={label} className="mr-1" {...props}>
      <XIcon />
    </Button>
  );
}

function TabActionsButton() {
  const { t } = useI18n();
  const { activePath } = useTabs();
  const actions = useTabActions(activePath);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label={t.shell.tabMenu}>
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {actions.map((item) => (
          <DropdownMenuItem key={item.label} disabled={item.disabled} onSelect={item.run}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
