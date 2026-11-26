import { useId, useLayoutEffect, useState, type ComponentProps } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Label = { label: string; hideLabel?: boolean };
const labelStyle = (hidden?: boolean) => (hidden ? "sr-only" : "text-muted-foreground");

export function TextField({
  label,
  hideLabel,
  error,
  hint,
  className,
  ...props
}: Label & { error?: string; hint?: string } & ComponentProps<"input">) {
  const id = useId();
  return (
    <Field data-invalid={error ? true : undefined} className="min-w-0 gap-1">
      <FieldLabel htmlFor={id} className={labelStyle(hideLabel)}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={className}
        {...props}
      />
      {hint && !error && <FieldDescription className="text-xs">{hint}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}

export function SelectField({
  label,
  hideLabel,
  value,
  options,
  onChange,
}: Label & { value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  // The list is a portal: close it when the tab is hidden.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <Field className="min-w-0 gap-1">
      <FieldLabel htmlFor={id} className={labelStyle(hideLabel)}>
        {label}
      </FieldLabel>
      <Select open={open} onOpenChange={setOpen} value={value} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger id={id} className="w-full min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
