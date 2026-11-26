import { createStore } from "../lib/create-store";
import { readItem, writeItem } from "../lib/storage";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "perika.theme";
// Keep in sync with `--bg` in styles.css and the script in index.html.
const BAR_COLOR = { light: "#FAFAF9", dark: "#0C0A09" };

const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const saved = readItem("local", KEY);
const store = createStore<{ choice: ThemeChoice }>({
  choice: saved === "light" || saved === "dark" ? saved : "system",
});

function apply() {
  const { choice } = store.get();
  const theme = choice === "system" ? (prefersDark.matches ? "dark" : "light") : choice;
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR_COLOR[theme]);
}

prefersDark.addEventListener("change", apply);
apply();

export function setTheme(choice: ThemeChoice) {
  writeItem("local", KEY, choice);
  store.set({ choice });
  apply();
}

export const useTheme = () => store.use().choice;
