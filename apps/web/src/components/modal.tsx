// Dialog on desktop, bottom drawer on mobile.
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useShown } from "../lib/use-shown";

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const desktop = useIsDesktop();
  const shown = useShown();
  // Closing goes back in history, which is asynchronous: ask only once.
  const asked = useRef(false);
  useEffect(() => {
    asked.current = false;
  }, [open]);

  function onOpenChange(next: boolean) {
    if (next || asked.current) return;
    asked.current = true;
    onClose();
  }

  if (!shown) return null;

  return desktop ? (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="max-h-[90dvh] overflow-y-auto"
      >
        {children}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        aria-describedby={undefined}
        className="data-[vaul-drawer-direction=bottom]:max-h-[90dvh]"
      >
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function ModalHeader({ title }: { title: string }) {
  const { t } = useI18n();
  const desktop = useIsDesktop();
  const Title = desktop ? DialogTitle : DrawerTitle;
  const Close = desktop ? DialogClose : DrawerClose;
  return (
    <div className="flex items-center justify-between gap-2">
      <Title className="text-xl font-normal">{title}</Title>
      <Close asChild>
        <Button variant="secondary" size="icon" aria-label={t.common.close}>
          <XIcon />
        </Button>
      </Close>
    </div>
  );
}

/** Changes on every opening. Use as `key` so form state starts fresh but survives the closing animation. */
export function useOpenKey(open: boolean) {
  const [state, setState] = useState({ open, key: 0 });
  if (state.open !== open) setState({ open, key: open ? state.key + 1 : state.key });
  return state.key;
}
