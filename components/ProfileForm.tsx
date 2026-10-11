"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/actions";
import { FIXED_EXPENSES, type FormState } from "@/lib/schemas";
import { buttonPrimary, card } from "@/lib/ui";
import Field from "./Field";
import FormSection from "./FormSection";

export default function ProfileForm({ defaults }: { defaults: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveProfile, {} as FormState);

  // Hata varsa kullanıcının yazdığını, yoksa veritabanındaki değeri göster
  const value = (name: string) => state.values?.[name] ?? defaults[name] ?? "";
  const error = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className={card}>
      <FormSection title="Gelir" description="Her ay eline geçen net tutar ve maaşının yattığı gün.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Aylık net gelir" name="monthlyIncome" inputMode="decimal" placeholder="40.000" suffix="₺" defaultValue={value("monthlyIncome")} error={error("monthlyIncome")} />
          <Field
            label="Maaş günü"
            name="payday"
            type="number"
            min={1}
            max={31}
            placeholder="15"
            hint="Ayın son günü için 31 yaz."
            defaultValue={value("payday")}
            error={error("payday")}
          />
        </div>
      </FormSection>

      <FormSection title="Sabit giderler" description="Her ay düzenli ödediklerin. Bütçen bunlar düşüldükten sonra hesaplanır.">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIXED_EXPENSES.map((field) => (
            <Field key={field.key} label={field.label} name={field.key} inputMode="decimal" placeholder="0" suffix="₺" defaultValue={value(field.key)} error={error(field.key)} />
          ))}
        </div>
      </FormSection>

      <div className="flex justify-end border-t border-line bg-panel px-5 py-3">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
