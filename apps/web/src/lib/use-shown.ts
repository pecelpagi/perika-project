import { useLayoutEffect, useState } from "react";

/**
 * False while the surrounding `<Activity>` is hidden. Portal content (dialogs, menus) must not
 * stay on screen when its tab is hidden, so callers unmount or close it.
 */
export function useShown() {
  const [shown, setShown] = useState(true);
  useLayoutEffect(() => {
    setShown(true);
    return () => setShown(false);
  }, []);
  return shown;
}
