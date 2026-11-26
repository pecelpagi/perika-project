import { useEffect, useRef, useState, type FormEvent } from "react";
import { sampleQuestions } from "../data/coach";
import { data, resolveApproval, sendChat } from "../data/store";
import type { ChatMessage } from "../data/types";
import { useI18n } from "../i18n";
import { Button, Input, Page } from "../ui";

function Message({ message }: { message: ChatMessage }) {
  const { t, date, pick } = useI18n();
  const mine = message.role === "user";
  return (
    <li className={`max-w-[85%] rounded-xl p-3 ${mine ? "self-end bg-accent text-on-accent" : "self-start border border-border bg-surface"}`}>
      <p className="break-words">{pick(message.text)}</p>
      {message.sources && (
        <div className="mt-2 border-t border-border pt-2 text-xs text-muted">
          <p className="font-medium">{t.coach.sources}</p>
          <ol className="list-decimal pl-4">
            {message.sources.map((source) => (
              <li key={source.title}>
                {source.title}, {date(source.date)}
              </li>
            ))}
          </ol>
        </div>
      )}
      {message.approval === "pending" && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-sm text-warning">⚠ {t.coach.approvalTitle}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => resolveApproval(message.id, "approved")}>{t.coach.approve}</Button>
            <Button variant="secondary" onClick={() => resolveApproval(message.id, "rejected")}>{t.coach.reject}</Button>
          </div>
        </div>
      )}
      {message.approval && message.approval !== "pending" && (
        <p className="mt-2 text-sm font-medium">{message.approval === "approved" ? `✓ ${t.coach.approved}` : `✕ ${t.coach.rejected}`}</p>
      )}
    </li>
  );
}

export function Coach() {
  const { t, pick } = useI18n();
  const { chat, coachBusy } = data.use();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const seen = useRef(chat.length);

  // Scroll down for new messages only, so returning to the tab keeps the scroll position.
  useEffect(() => {
    if (chat.length > seen.current) end.current?.scrollIntoView({ block: "end" });
    seen.current = chat.length;
  }, [chat.length]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || coachBusy) return;
    sendChat(text.trim());
    setText("");
  }

  return (
    <Page className="min-h-full max-w-2xl !pb-0">
      <div className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted">{t.coach.intro}</p>
        <ul aria-live="polite" className="flex flex-col gap-3">
          {chat.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </ul>
        {coachBusy && <p className="text-sm text-muted">{t.coach.thinking}</p>}
        <div className="mt-auto flex flex-wrap gap-2">
          {sampleQuestions.map((question) => (
            <Button key={question.en} variant="secondary" className="py-2 text-left" disabled={coachBusy} onClick={() => sendChat(question)}>
              {pick(question)}
            </Button>
          ))}
        </div>
      </div>
      <div ref={end} />
      <form onSubmit={submit} className="sticky bottom-0 -mx-4 border-t border-border bg-bg px-4 py-3 md:mx-0 md:px-0">
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input label={t.coach.placeholder} hideLabel placeholder={t.coach.placeholder} value={text} onChange={(e) => setText(e.target.value)} enterKeyHint="send" autoComplete="off" />
          </div>
          <Button type="submit" disabled={!text.trim() || coachBusy}>{t.coach.send}</Button>
        </div>
        <p className="mt-2 text-xs text-muted">{t.coach.note}</p>
      </form>
    </Page>
  );
}
