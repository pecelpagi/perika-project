import { useState, type FormEvent } from "react";
import { goldSummary, isOldPrice, newestFirst } from "../data/calc";
import { parseAmount } from "../data/fake-parser";
import { todayIso } from "../data/format";
import { GOLD_TARGET, newGoldPrice } from "../data/seed";
import { addTxn, data, setGoldPrice } from "../data/store";
import { useI18n } from "../i18n";
import { useSheet } from "../shell/nav";
import { Button, Card, Details, Input, ListRow, Modal, Page, Progress } from "../ui";

function PurchaseModal({ onClose }: { onClose: () => void }) {
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
    <Modal title={reviewing ? t.gold.confirmTitle : t.gold.add} onClose={onClose}>
      {reviewing && amount ? (
        <>
          <Details rows={[[t.common.grams, `${number(weight)} g`], [t.gold.total, money(amount)]]} />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setReviewing(false)}>
              {t.common.edit}
            </Button>
            <Button className="flex-1" onClick={save}>{t.common.save}</Button>
          </div>
        </>
      ) : (
        <form noValidate onSubmit={review} className="flex flex-col gap-4">
          <Input
            label={t.common.grams}
            inputMode="decimal"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            error={submitted && !(weight > 0) ? t.gold.invalidGrams : undefined}
          />
          <Input
            label={t.gold.total}
            inputMode="decimal"
            placeholder="5,2jt"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            error={submitted && !amount ? t.common.invalidAmount : undefined}
          />
          <Button type="submit">{t.gold.review}</Button>
        </form>
      )}
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

  return (
    <Page>
      <Button onClick={addSheet.show} className="md:self-start">{t.gold.add}</Button>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title={t.gold.holdings}>
          <p className="text-4xl font-semibold tabular-nums">{number(gold.grams)} g</p>
          <Details
            rows={[
              [t.gold.value, money(gold.value)],
              [
                gold.gain < 0 ? t.gold.loss : t.gold.gain,
                <span className={gold.gain < 0 ? "text-negative" : "text-positive"}>
                  {gold.gain < 0 ? "▼ " : "▲ "}
                  {money(Math.abs(gold.gain))}
                </span>,
              ],
            ]}
          />
        </Card>
        <Card title={t.gold.price}>
          <p className="text-3xl font-semibold tabular-nums">{money(goldPrice.buybackPerGram)}</p>
          <p className="mt-1 text-sm text-muted">{t.gold.priceSource(goldPrice.source, date(goldPrice.date))}</p>
          {isOldPrice(goldPrice, todayIso()) && <p className="mt-2 text-sm text-warning">⚠ {t.gold.oldPrice}</p>}
          <Button variant="secondary" className="mt-3" onClick={priceSheet.show}>{t.gold.checkPrice}</Button>
        </Card>
        <Card title={t.gold.target}>
          <p className="mb-3 text-xl tabular-nums">{t.gold.ofTarget(number(share, 0), compact(GOLD_TARGET))}</p>
          <Progress label={t.gold.target} value={gold.value} max={GOLD_TARGET} />
        </Card>
        <Card title={t.gold.zakat}>
          <p className="text-xl">
            {gold.zakat > 0 ? t.gold.zakatDue(money(gold.zakat)) : t.gold.zakatBelow(number(gold.belowNisab))}
          </p>
          <p className="mt-2 text-sm text-muted">{t.gold.zakatNote}</p>
        </Card>
      </div>
      <Card title={t.gold.purchases}>
        <ul>
          {newestFirst(txns).filter((x) => x.kind === "gold").map((x) => (
            <ListRow key={x.id} title={`${number(x.grams ?? 0)} g`} detail={date(x.date)} end={money(x.amount)} />
          ))}
        </ul>
      </Card>

      {addSheet.open && <PurchaseModal onClose={addSheet.hide} />}
      {priceSheet.open && (
        <Modal title={t.gold.newPriceTitle} onClose={priceSheet.hide}>
          <p className="text-3xl font-semibold tabular-nums">{money(found.buybackPerGram)}</p>
          <p className="text-sm text-muted">{t.gold.priceSource(found.source, date(found.date))}</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={priceSheet.hide}>{t.common.cancel}</Button>
            <Button
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
      )}
    </Page>
  );
}
