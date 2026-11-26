import { CameraIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { TextField } from "@/components/fields";
import { Modal, ModalHeader } from "@/components/modal";
import { Details, Page, SectionCard } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { goldSummary, spentIn } from "../data/calc";
import { needsConfirm, parseInput } from "../data/fake-parser";
import { todayIso } from "../data/format";
import { addTxn, clearPhoto, data, readPhoto, undoTxn } from "../data/store";
import type { Draft } from "../data/types";
import { useI18n } from "../i18n";
import { useSheet } from "../shell/nav";
import { Amount, CategorySelect, TxnCategorySelect } from "./shared";

export function RecordScreen() {
  const { t, money, number, pick } = useI18n();
  const { categories, txns, goldPrice, photo } = data.use();
  const sheet = useSheet("record-confirm");
  const [text, setText] = useState("");
  const [error, setError] = useState<"amount" | "grams">();
  const [draft, setDraft] = useState<Draft>();
  // The saved draft stays rendered while the confirmation closes, but cannot reopen it.
  const [confirmed, setConfirmed] = useState(false);
  const [savedId, setSavedId] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);
  const saved = txns.find((x) => x.id === savedId);
  const category = categories.find((c) => c.id === saved?.categoryId);

  function ask(next: Draft) {
    setDraft(next);
    setConfirmed(false);
    sheet.show();
  }

  function save(next: Draft) {
    setSavedId(addTxn(next));
    setText("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = parseInput(text, todayIso(), data.get().txns);
    if ("error" in result) return setError(result.error);
    setError(undefined);
    if (needsConfirm(result.draft)) ask(result.draft);
    else save(result.draft);
  }

  // The photo result arrives from the store, even if this tab was hidden meanwhile.
  useEffect(() => {
    if (photo.status !== "ready") return;
    clearPhoto();
    ask(photo.draft);
  }, [photo]);

  const reason = !draft
    ? ""
    : draft.duplicateOf
      ? t.record.duplicate
      : draft.kind === "gold"
        ? t.record.goldAsk
        : draft.source === "photo"
          ? t.record.photoAsk
          : t.record.unsure;

  return (
    <Page className="min-h-full max-w-xl">
      <div className="flex flex-1 flex-col gap-4 md:order-2">
        {saved && (
          <motion.div key={saved.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SectionCard title={t.record.saved}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-xl">{saved.note}</p>
                <p className="text-xl font-semibold"><Amount txn={saved} /></p>
              </div>
              {category && (
                <div className="mb-3">
                  <p className="mb-3 text-muted-foreground">
                    {t.record.leftIn(money(category.budget - spentIn(txns, saved.date.slice(0, 7), category.id)), pick(category.name))}
                  </p>
                  <TxnCategorySelect txn={saved} />
                </div>
              )}
              {saved.kind === "gold" && <p className="mb-3 text-muted-foreground">{t.record.goldNow(number(goldSummary(txns, goldPrice).grams))}</p>}
              <Button variant="outline" size="lg" onClick={() => undoTxn(saved.id)}>
                {t.common.undo}
              </Button>
            </SectionCard>
          </motion.div>
        )}
      </div>

      {/* Fixed above the bottom navigation on mobile, first on desktop. */}
      <form onSubmit={submit} className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t bg-background p-4 md:static md:order-1 md:m-0 md:border-0 md:p-0">
        <TextField
          label={t.record.label}
          placeholder={t.record.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={error === "amount" ? t.record.errorAmount : error === "grams" ? t.record.errorGrams : undefined}
          hint={t.record.hint}
          enterKeyHint="done"
          autoComplete="off"
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="lg" disabled={photo.status === "reading"} onClick={() => fileInput.current?.click()}>
            {photo.status === "reading" ? <Spinner aria-hidden /> : <CameraIcon />}
            {photo.status === "reading" ? t.record.reading : t.record.photo}
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={!text.trim()}>
            {t.common.save}
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            if (e.target.files?.length) readPhoto();
            e.target.value = "";
          }}
        />
      </form>

      <Modal open={sheet.open && !!draft && !confirmed} onClose={sheet.hide}>
        <ModalHeader title={t.record.confirmTitle} />
        {draft && (
          <>
            <p className="text-warning">⚠ {reason}</p>
            <Details
              rows={[
                [t.common.note, draft.note],
                [t.common.type, t.common.kind[draft.kind]],
                [t.common.amount, money(draft.amount)],
                ...(draft.grams ? [[t.common.grams, `${number(draft.grams)} g`] as [string, string]] : []),
              ]}
            />
            {draft.kind === "spending" && (
              <CategorySelect value={draft.categoryId ?? "other"} onChange={(categoryId) => setDraft({ ...draft, categoryId })} />
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={sheet.hide}>
                {t.common.cancel}
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  save(draft);
                  setConfirmed(true);
                  sheet.hide();
                }}
              >
                {t.common.save}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </Page>
  );
}
