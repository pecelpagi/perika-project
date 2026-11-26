import { useRouter } from "@tanstack/react-router";
import { data, removeTxn } from "../data/store";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useSheet } from "../shell/nav";
import type { ScreenProps } from "../shell/TabPanels";
import { useTabs } from "../shell/tabs-store";
import { Button, Card, Details, EmptyState, Modal, Page } from "../ui";
import { Amount, TxnCategorySelect } from "./shared";

export function TransactionDetail({ path, params }: ScreenProps) {
  const { t, date, number } = useI18n();
  const { txns } = data.use();
  const router = useRouter();
  const desktop = useIsDesktop();
  const { close, drop } = useTabs();
  const sheet = useSheet(`delete:${path}`);
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
      <Card>
        <p className="text-sm text-muted">{txn.note}</p>
        <p className="text-4xl font-semibold"><Amount txn={txn} /></p>
        <Details
          rows={[
            [t.common.date, date(txn.date)],
            [t.common.type, t.common.kind[txn.kind]],
            [t.detail.source, t.common.source[txn.source]],
            ...(txn.grams ? [[t.common.grams, `${number(txn.grams)} g`] as [string, string]] : []),
          ]}
        />
        {txn.kind === "spending" && <TxnCategorySelect txn={txn} />}
      </Card>
      <Button variant="danger" className="md:self-start" onClick={sheet.show}>
        {t.common.delete}
      </Button>
      {sheet.open && (
        <Modal title={t.detail.deleteTitle} onClose={sheet.hide}>
          <p className="text-muted">{t.detail.deleteBody}</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={sheet.hide}>
              {t.common.cancel}
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => remove(txn.id)}>
              {t.common.delete}
            </Button>
          </div>
        </Modal>
      )}
    </Page>
  );
}
