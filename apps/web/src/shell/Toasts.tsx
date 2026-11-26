// Shows the store's toast with Sonner. The store keeps the timer, so Sonner's own is off.
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { data, dismissToast, undoTxn } from "../data/store";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useTheme } from "../theme/theme";

export function Toasts() {
  const { t } = useI18n();
  const current = data.use().toast;
  const theme = useTheme();
  const desktop = useIsDesktop();
  // One id while a toast is up, so a replacement updates it in place.
  const round = useRef(0);

  useEffect(() => {
    const id = `perika-${round.current}`;
    if (!current) {
      toast.dismiss(id);
      round.current += 1;
      return;
    }
    toast(t.toast[current.key], {
      id,
      duration: Infinity,
      onDismiss: dismissToast,
      action: {
        label: current.undoId ? t.common.undo : t.common.close,
        onClick: (event) => {
          event.preventDefault();
          if (current.undoId) undoTxn(current.undoId);
          else dismissToast();
        },
      },
    });
  }, [current, t]);

  // Logging out unmounts the shell: take the toast along.
  useEffect(() => () => void toast.dismiss(), []);

  // Stay clear of the tab bar on desktop and the header on mobile.
  const offset = { top: desktop ? 72 : "calc(4.5rem + env(safe-area-inset-top))" };

  return (
    <Toaster
      theme={theme}
      position="top-center"
      offset={offset}
      mobileOffset={offset}
      containerAriaLabel={t.shell.notifications}
    />
  );
}
