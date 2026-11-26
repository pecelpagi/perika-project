import { CoinsIcon, HandCoinsIcon, ReceiptTextIcon, TagIcon, TargetIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { TextField } from "@/components/fields";
import { ListRow, RowList } from "@/components/list";
import { Modal, ModalHeader, useOpenKey } from "@/components/modal";
import { Details, Meter, Page, SectionCard } from "@/components/page";
import { Button } from "@/components/ui/button";
import { goldSummary, isOldPrice, newestFirst } from "../data/calc";
import { parseAmount } from "../data/fake-parser";
import { todayIso } from "../data/format";
import { GOLD_TARGET, newGoldPrice } from "../data/seed";
import { addTxn, data, setGoldPrice } from "../data/store";
import { useI18n } from "../i18n";
import { useSheet } from "../shell/nav";

// State lives outside the modal, so typed values survive the switch between drawer and dialog.
function PurchaseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, money, number } = useI18n();
  const [grams, setGrams] = useState("");
  const [total, setTotal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const weight = Number(grams.replace(",", "."));
  const amount = parseAmount(total);
  const valid = weight > 0 && !!amount;

  function review(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setReviewing(valid);
  }

  function save() {
    if (!amount) return;
    addTxn({
      date: todayIso(),
      kind: "gold",
      amount,
      grams: weight,
      note: `Emas ${grams.trim()} gram`,
      source: "text",
      confidence: 1,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={reviewing ? t.gold.confirmTitle : t.gold.add} />
      <motion.div key={String(reviewing)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
        {reviewing && amount ? (
          <>
            <Details rows={[[t.common.grams, `${number(weight)} g`], [t.gold.total, money(amount)]]} />
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setReviewing(false)}>
                {t.common.edit}
              </Button>
              <Button size="lg" className="flex-1" onClick={save}>{t.common.save}</Button>
            </div>
          </>
        ) : (
          <form noValidate onSubmit={review} className="flex flex-col gap-4">
            <TextField
              label={t.common.grams}
              inputMode="decimal"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              error={submitted && !(weight > 0) ? t.gold.invalidGrams : undefined}
            />
            <TextField
              label={t.gold.total}
              inputMode="decimal"
              placeholder="5,2jt"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              error={submitted && !amount ? t.common.invalidAmount : undefined}
            />
            <Button type="submit" size="lg">{t.gold.review}</Button>
          </form>
        )}
      </motion.div>
    </Modal>
  );
}

export function Gold() {
  const { t, money, compact, number, date } = useI18n();
  const { txns, goldPrice } = data.use();
  const addSheet = useSheet("gold-add");
  const priceSheet = useSheet("gold-price");
  const gold = goldSummary(txns, goldPrice);
  const share = (gold.value / GOLD_TARGET) * 100;
  const found = newGoldPrice();
  const addKey = useOpenKey(addSheet.open);

  return (
    <Page>
      <Button size="lg" onClick={addSheet.show} className="md:self-start">{t.gold.add}</Button>
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title={t.gold.holdings} icon={CoinsIcon}>
          <p className="num text-4xl">{number(gold.grams)} g</p>
          <Details
            rows={[
              [t.gold.value, money(gold.value)],
              [
                gold.gain < 0 ? t.gold.loss : t.gold.gain,
                <span className={gold.gain < 0 ? "text-destructive" : "text-success"}>
                  {gold.gain < 0 ? "▼ " : "▲ "}
                  {money(Math.abs(gold.gain))}
                </span>,
              ],
            ]}
          />
        </SectionCard>
        <SectionCard title={t.gold.price} icon={TagIcon}>
          <p className="num text-4xl">{money(goldPrice.buybackPerGram)}</p>
          <p className="mt-1 text-muted-foreground">{t.gold.priceSource(goldPrice.source, date(goldPrice.date))}</p>
          {isOldPrice(goldPrice, todayIso()) && <p className="mt-2 text-warning">⚠ {t.gold.oldPrice}</p>}
          <Button variant="outline" size="lg" className="mt-4" onClick={priceSheet.show}>{t.gold.checkPrice}</Button>
        </SectionCard>
        <SectionCard title={t.gold.target} icon={TargetIcon}>
          <p className="num mb-4 text-xl">{t.gold.ofTarget(number(share, 0), compact(GOLD_TARGET))}</p>
          <Meter tone="warning" label={t.gold.target} value={gold.value} max={GOLD_TARGET} />
        </SectionCard>
        <SectionCard title={t.gold.zakat} icon={HandCoinsIcon}>
          <p className="text-xl">
            {gold.zakat > 0 ? t.gold.zakatDue(money(gold.zakat)) : t.gold.zakatBelow(number(gold.belowNisab))}
          </p>
          <p className="mt-2 text-muted-foreground">{t.gold.zakatNote}</p>
        </SectionCard>
      </div>
      <SectionCard title={t.gold.purchases} icon={ReceiptTextIcon}>
        <RowList>
          {newestFirst(txns).filter((x) => x.kind === "gold").map((x) => (
            <ListRow key={x.id} title={`${number(x.grams ?? 0)} g`} detail={date(x.date)} end={money(x.amount)} />
          ))}
        </RowList>
      </SectionCard>

      <PurchaseModal key={addKey} open={addSheet.open} onClose={addSheet.hide} />
      <Modal open={priceSheet.open} onClose={priceSheet.hide}>
        <ModalHeader title={t.gold.newPriceTitle} />
        <p className="num text-4xl">{money(found.buybackPerGram)}</p>
        <p className="text-muted-foreground">{t.gold.priceSource(found.source, date(found.date))}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="flex-1" onClick={priceSheet.hide}>{t.common.cancel}</Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              setGoldPrice(found);
              priceSheet.hide();
            }}
          >
            {t.common.save}
          </Button>
        </div>
      </Modal>
    </Page>
  );
}
