import type { ReactNode } from "react";

/** Card header icon: see `ui/_overrides.md`, "Custom components". */
export function IconCircle({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-card-foreground [&_svg]:size-5">
      {children}
    </span>
  );
}
