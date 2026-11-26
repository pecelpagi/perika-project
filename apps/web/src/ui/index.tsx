import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { Icon } from "./icons";

const BUTTON = {
  primary: "bg-accent text-on-accent hover:opacity-90",
  secondary: "border border-control hover:bg-text/5",
  ghost: "text-accent hover:bg-text/5",
  danger: "border border-negative text-negative hover:bg-negative/10",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof BUTTON }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition ${BUTTON[variant]} ${className}`}
      {...props}
    />
  );
}

const CONTROL = "min-h-11 w-full min-w-0 rounded-lg border border-control bg-surface px-3 text-base";

type FieldProps = { label: string; hideLabel?: boolean; error?: string; hint?: string };

function Field({ id, label, hideLabel, error, hint, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "text-sm text-muted"}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-negative">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ label, hideLabel, error, hint, className = "", ...props }: FieldProps & ComponentProps<"input">) {
  const id = useId();
  return (
    <Field id={id} label={label} hideLabel={hideLabel} error={error} hint={hint}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CONTROL} ${className}`}
        {...props}
      />
    </Field>
  );
}

export function Select({
  label,
  hideLabel,
  options,
  ...props
}: FieldProps & ComponentProps<"select"> & { options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <Field id={id} label={label} hideLabel={hideLabel}>
      <select id={id} className={CONTROL} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Page({ children, className = "max-w-5xl" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto flex w-full flex-col gap-4 p-4 md:gap-6 md:p-8 ${className}`}>{children}</div>;
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-border bg-surface p-4 md:p-6 ${className}`}>
      {title && <h2 className="mb-2 text-sm font-medium text-muted">{title}</h2>}
      {children}
    </section>
  );
}

export function Progress({ value, max, label, over }: { value: number; max: number; label: string; over?: boolean }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : value > 0 ? 100 : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 overflow-hidden rounded-full bg-text/10"
    >
      <div className={`h-full rounded-full ${over ? "bg-negative" : "bg-accent"}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex max-w-full rounded-lg border border-border bg-bg p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={`min-h-11 min-w-11 flex-auto rounded-md px-3 text-sm whitespace-nowrap md:min-h-9 md:px-2 ${
            option.value === value ? "bg-accent font-medium text-on-accent" : "text-muted hover:text-text"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ListRow({
  title,
  detail,
  end,
  onClick,
}: {
  title: ReactNode;
  detail?: ReactNode;
  end?: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        {detail && <span className="block truncate text-sm text-muted">{detail}</span>}
      </span>
      {end && <span className="shrink-0 text-right tabular-nums">{end}</span>}
      {onClick && <Icon name="chevron" className="size-4 text-muted" />}
    </>
  );
  const style = "flex min-h-14 w-full items-center gap-3 py-2 text-left";
  return (
    <li className="border-b border-border last:border-0">
      {onClick ? (
        <button type="button" onClick={onClick} className={`${style} hover:bg-text/5`}>
          {content}
        </button>
      ) : (
        <div className={style}>{content}</div>
      )}
    </li>
  );
}

/** Native modal dialog: focus trap and Esc come from the browser. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className="modal max-h-[90dvh] border border-border bg-surface p-0 text-text shadow-xl"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button type="button" aria-label={t.common.close} onClick={onClose} className="grid size-11 place-items-center rounded-lg hover:bg-text/5">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function Details({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-3">
          <dt className="text-muted">{label}</dt>
          <dd className="min-w-0 break-words text-right tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-12 text-center text-muted">{children}</p>;
}
