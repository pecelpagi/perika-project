import { ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode, Ref } from "react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";

/** Rows fade in when added and slide to their new place; rows present at first render do not animate. */
export function RowList({ children }: { children: ReactNode }) {
  return (
    <ItemGroup className="relative gap-0 divide-y has-data-[size=sm]:gap-0">
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </ItemGroup>
  );
}

export function ListRow({
  ref,
  title,
  detail,
  end,
  onClick,
}: {
  ref?: Ref<HTMLDivElement>;
  title: ReactNode;
  detail?: ReactNode;
  end?: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <ItemContent className="min-w-0 gap-0">
        <ItemTitle className="block w-full truncate text-base font-normal">{title}</ItemTitle>
        {detail && <ItemDescription className="line-clamp-1">{detail}</ItemDescription>}
      </ItemContent>
      <ItemActions className="shrink-0 text-right tabular-nums">
        {end}
        {onClick && <ChevronRightIcon aria-hidden className="size-4 text-muted-foreground" />}
      </ItemActions>
    </>
  );
  const style = "min-h-14 flex-nowrap rounded-none border-0 px-0 py-2 text-left text-base";

  return (
    <motion.div
      ref={ref}
      role="listitem"
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {onClick ? (
        <Item asChild size="sm" className={`${style} hover:bg-muted/50`}>
          <button type="button" onClick={onClick}>
            {content}
          </button>
        </Item>
      ) : (
        <Item size="sm" className={style}>
          {content}
        </Item>
      )}
    </motion.div>
  );
}
