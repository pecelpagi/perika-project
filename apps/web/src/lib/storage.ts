// Storage can be blocked (private mode, site settings), so every access is guarded.
type Kind = "local" | "session";

const area = (kind: Kind) => (kind === "local" ? localStorage : sessionStorage);

export function readItem(kind: Kind, key: string): string | null {
  try {
    return area(kind).getItem(key);
  } catch {
    return null;
  }
}

/** Returns false if the value could not be stored; it then only lasts for this page load. */
export function writeItem(kind: Kind, key: string, value: string | null) {
  try {
    if (value === null) area(kind).removeItem(key);
    else area(kind).setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
