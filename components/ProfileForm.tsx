"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/actions";
import { FIXED_EXPENSES, type FormState } from "@/lib/schemas";
import Field from "./Field";

export default function ProfileForm({ defaults }: { defaults: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveProfile, {} as FormState);

  // Hata varsa kullanıcının yazdığını, yoksa veritabanındaki değeri göster
  const value = (name: string) => state.values?.[name] ?? defaults[name] ?? "";
  const error = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Aylık net gelir (₺)"
        name="monthlyIncome"
        inputMode="decimal"
        placeholder="40.000"
        defaultValue={value("monthlyIncome")}
        error={error("monthlyIncome")}
      />
      <Field
        label="Maaş günü"
        name="payday"
        type="number"
        min={1}
        max={31}
        placeholder="15"
        hint="Maaşın ayın kaçında yatıyor? Ayın son günü için 31 yaz."
        defaultValue={value("payday")}
        error={error("payday")}
      />

      <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
        <legend className="px-1 text-sm font-medium">Aylık sabit giderler (₺, boş bırakabilirsin)</legend>
        {FIXED_EXPENSES.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            name={field.key}
            inputMode="decimal"
            placeholder="0"
            defaultValue={value(field.key)}
            error={error(field.key)}
          />
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : "Kaydet ve devam et"}
      </button>
    </form>
  );
}