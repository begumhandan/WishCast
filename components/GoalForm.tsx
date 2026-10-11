"use client";

import { useActionState } from "react";
import { saveGoal } from "@/app/actions";
import type { FormState } from "@/lib/schemas";
import { buttonPrimary, card } from "@/lib/ui";
import Field from "./Field";
import FormSection from "./FormSection";

export default function GoalForm({ defaults }: { defaults: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveGoal, {} as FormState);

  const value = (name: string) => state.values?.[name] ?? defaults[name] ?? "";
  const error = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className={card}>
      <FormSection title="Ne almak istiyorsun?" description="Hedefinin adı, bugünkü fiyatı ve şu ana kadar ayırdığın para.">
        <Field label="Hedef" name="name" placeholder="iPhone 17, tatil, yeni bisiklet…" maxLength={60} defaultValue={value("name")} error={error("name")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bugünkü fiyatı" name="price" inputMode="decimal" placeholder="60.000" suffix="₺" defaultValue={value("price")} error={error("price")} />
          <Field label="Biriktirdiğin" name="saved" inputMode="decimal" placeholder="0" suffix="₺" defaultValue={value("saved")} error={error("saved")} />
        </div>
      </FormSection>

      <FormSection title="Zamanlama" description="Ne zamana kadar almak istediğin ve fiyatın her ay ne kadar artmasını beklediğin.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Süre" name="targetMonths" type="number" min={1} max={120} placeholder="6" suffix="ay" defaultValue={value("targetMonths")} error={error("targetMonths")} />
          <Field
            label="Aylık fiyat artışı"
            name="inflationPercent"
            inputMode="decimal"
            placeholder="2,5"
            suffix="%"
            hint="Bilmiyorsan boş bırak."
            defaultValue={value("inflationPercent")}
            error={error("inflationPercent")}
          />
        </div>
      </FormSection>

      <div className="flex justify-end border-t border-line bg-panel px-5 py-3">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Kaydediliyor…" : "Hedefi kaydet"}
        </button>
      </div>
    </form>
  );
}
