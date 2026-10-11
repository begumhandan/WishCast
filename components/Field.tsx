import type { InputHTMLAttributes } from "react";
import { input } from "@/lib/ui";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  /** Alanın sağında gösterilecek birim, ör. "₺", "%", "ay" */
  suffix?: string;
};

export default function Field({ label, error, hint, suffix, ...props }: FieldProps) {
  const describedBy = error || hint ? `${props.name}-help` : undefined;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="relative">
        <input
          {...props}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${input} ${suffix ? "pr-10" : ""} ${error ? "border-negative focus:border-negative focus:ring-negative/20" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">{suffix}</span>
        )}
      </span>
      {(error || hint) && (
        <span id={describedBy} className={`text-xs ${error ? "text-negative" : "text-muted"}`}>
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
