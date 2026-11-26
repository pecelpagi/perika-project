import { createStore } from "../lib/create-store";
import { readItem, writeItem } from "../lib/storage";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "perika.theme";
// Keep in sync with `--background` in styles/globals.css and the script in index.html.
const BAR_COLOR = { light: "#F3F3F3", dark: "#0B0D0B" };

const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const saved = readItem("local", KEY);
const store = createStore<{ choice: ThemeChoice }>({
  choice: saved === "light" || saved === "dark" ? saved : "system",
});

function apply() {
  const { choice } = store.get();
  const theme = choice === "system" ? (prefersDark.matches ? "dark" : "light") : choice;
  const root = document.documentElement;
  const paint = () => {
    root.classList.toggle("dark", theme === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR_COLOR[theme]);
  };
  // A view transition cross-fades the whole page, portals included.
  const unchanged = root.classList.contains("dark") === (theme === "dark");
  if (unchanged || !document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return paint();
  // `ready` rejects when the browser skips the fade, for example in a background tab. The theme still applies.
  document.startViewTransition(paint).ready.catch(() => {});
}

prefersDark.addEventListener("change", apply);
apply();

export function setTheme(choice: ThemeChoice) {
  writeItem("local", KEY, choice);
  store.set({ choice });
  apply();
}

export const useTheme = () => store.use().choice;
