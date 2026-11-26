export type PageId =
  | "home"
  | "record"
  | "transactions"
  | "transaction"
  | "budget"
  | "gold"
  | "freedom"
  | "coach"
  | "more";

export type PageMatch = { path: string; pageId: PageId; params: { id?: string } };

export const PATHS: Record<Exclude<PageId, "transaction">, string> = {
  home: "/",
  record: "/record",
  transactions: "/transactions",
  budget: "/budget",
  gold: "/gold",
  freedom: "/freedom",
  coach: "/coach",
  more: "/more",
};

export const transactionPath = (id: string) => `/transactions/${encodeURIComponent(id)}`;

export const normalizePath = (pathname: string) => pathname.replace(/(.)\/+$/, "$1");

export function matchPage(pathname: string): PageMatch | null {
  const path = normalizePath(pathname);
  const found = Object.entries(PATHS).find(([, value]) => value === path);
  if (found) return { path, pageId: found[0] as PageId, params: {} };

  const id = /^\/transactions\/([^/?#]+)$/.exec(path)?.[1];
  if (!id) return null;
  try {
    return { path, pageId: "transaction", params: { id: decodeURIComponent(id) } };
  } catch {
    return null;
  }
}
