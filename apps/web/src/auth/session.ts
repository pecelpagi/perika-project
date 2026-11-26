// Fake session. Passwords are never stored. Real authentication comes with the backend.
import { useRouter } from "@tanstack/react-router";
import { resetData } from "../data/store";
import { readItem, writeItem } from "../lib/storage";
import { matchPage } from "../shell/pages";
import { TABS_KEY } from "../shell/tabs-store";

const KEY = "perika.session";
// Used when storage is blocked, so login still works for this page load.
let memory: string | null = null;

export function readSession(): { email: string } | null {
  try {
    const value: unknown = JSON.parse(readItem("local", KEY) ?? memory ?? "null");
    const email = (value as { email?: unknown } | null)?.email;
    return typeof email === "string" && email ? { email } : null;
  } catch {
    return null;
  }
}

export function startSession(email: string) {
  const value = JSON.stringify({ email });
  memory = writeItem("local", KEY, value) ? null : value;
}

/** Only in-app paths; anything else goes Home. */
export const safeRedirect = (target: unknown) => (typeof target === "string" && matchPage(target) ? target : "/");

export function useLogOut() {
  const router = useRouter();
  return () => {
    memory = null;
    writeItem("local", KEY, null);
    writeItem("session", TABS_KEY, null);
    resetData();
    router.history.replace("/login");
  };
}
