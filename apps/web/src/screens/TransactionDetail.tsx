import { useRouter } from "@tanstack/react-router";
import { Details, EmptyState, Page, SectionCard } from "@/components/page";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { data, removeTxn } from "../data/store";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useShown } from "../lib/use-shown";
import { useSheet } from "../shell/nav";
import type { ScreenProps } from "../shell/TabPanels";
import { useTabs } from "../shell/tabs-store";
import { Amount, TxnCategorySelect } from "./shared";

export function TransactionDetail({ path, params }: ScreenProps) {
  const { t, date, number } = useI18n();
  const { txns } = data.use();
  const router = useRouter();
  const desktop = useIsDesktop();
  const { close, drop } = useTabs();
  const sheet = useSheet(`delete:${path}`);
  const shown = useShown();
  const txn = txns.find((x) => x.id === params.id);

  if (!txn) return <EmptyState>{t.detail.notFound}</EmptyState>;

  function remove(id: string) {
    removeTxn(id);
    // Desktop shows the neighbour tab. Mobile leaves both the dialog entry and this page.
    if (!desktop && router.history.location.state.__TSR_index >= 2) {
      drop(path);
      router.history.go(-2);
    } else close(path);
  }

  return (
    <Page className="max-w-xl">
      <SectionCard>
        <p className="text-muted-foreground">{txn.note}</p>
        <p className="mb-2 text-4xl font-semibold"><Amount txn={txn} /></p>
        <Details
          rows={[
            [t.common.date, date(txn.date)],
            [t.common.type, t.common.kind[txn.kind]],
            [t.detail.source, t.common.source[txn.source]],
            ...(txn.grams ? [[t.common.grams, `${number(txn.grams)} g`] as [string, string]] : []),
          ]}
        />
        {txn.kind === "spending" && <TxnCategorySelect txn={txn} />}
      </SectionCard>
      <Button variant="destructive" size="lg" className="md:self-start" onClick={sheet.show}>
        {t.common.delete}
      </Button>
      <AlertDialog open={sheet.open && shown} onOpenChange={(open) => !open && sheet.hide()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.detail.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.detail.deleteBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="lg">{t.common.cancel}</AlertDialogCancel>
            {/* Not AlertDialogAction: it would also go back in history while `remove` navigates. */}
            <Button variant="destructive" size="lg" onClick={() => remove(txn.id)}>
              {t.common.delete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
