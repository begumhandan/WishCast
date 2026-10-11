"use client";

import { useActionState } from "react";
import { saveGoal } from "@/app/actions";
import type { FormState } from "@/lib/schemas";
import Field from "./Field";

export default function GoalForm({ defaults }: { defaults: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveGoal, {} as FormState);

  const value = (name: string) => state.values?.[name] ?? defaults[name] ?? "";
  const error = (name: string) => state.errors?.[name]?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Ne almak istiyorsun?"
        name="name"
        placeholder="iPhone 17"
        maxLength={60}
        defaultValue={value("name")}
        error={error("name")}
      />
      <Field
        label="Bugünkü fiyatı (₺)"
        name="price"
        inputMode="decimal"
        placeholder="60.000"
        defaultValue={value("price")}
        error={error("price")}
      />
      <Field
        label="Şu ana kadar biriktirdiğin (₺)"
        name="saved"
        inputMode="decimal"
        placeholder="0"
        defaultValue={value("saved")}
        error={error("saved")}
      />
      <Field
        label="Kaç ayda almak istiyorsun?"
        name="targetMonths"
        type="number"
        min={1}
        max={120}
        placeholder="6"
        defaultValue={value("targetMonths")}
        error={error("targetMonths")}
      />
      <Field
        label="Tahmini aylık fiyat artışı (%)"
        name="inflationPercent"
        inputMode="decimal"
        placeholder="2,5"
        hint="Fiyatın her ay yüzde kaç artmasını bekliyorsun? Bilmiyorsan boş bırak."
        defaultValue={value("inflationPercent")}
        error={error("inflationPercent")}
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : "Hedefi kaydet"}
      </button>
    </form>
  );
}