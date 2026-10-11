import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

export default function Field({ label, error, hint, ...input }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-left">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...input}
        aria-invalid={error ? true : undefined}
        className={`rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </label>
  );
}