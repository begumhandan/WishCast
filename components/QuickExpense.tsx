"use client";

import { useActionState } from "react";
import { addExpense } from "@/app/actions";
import { CATEGORIES, type FormState } from "@/lib/schemas";
import ImpactToast from "./ImpactToast";

export default function QuickExpense() {
  const [state, formAction, pending] = useActionState(addExpense, {} as FormState);
  const error = (name: string) => state.errors?.[name]?.[0];
  const selected = state.values?.category ?? CATEGORIES[0];

  return (
    <section className="rounded-2xl border border-gray-200 p-6 text-left">
      <h2 className="text-lg font-semibold">Harcama ekle</h2>

      <form action={formAction} className="mt-3 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <label key={category} className="cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category}
                defaultChecked={category === selected}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-gray-300 px-3 py-1 text-sm peer-checked:border-black peer-checked:bg-black peer-checked:text-white">
                {category}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            name="amount"
            inputMode="decimal"
            placeholder="Tutar (₺)"
            defaultValue={state.values?.amount ?? ""}
            aria-invalid={error("amount") ? true : undefined}
            className="w-32 rounded-lg border border-gray-300 px-3 py-2"
          />
          <input
            name="note"
            placeholder="Not (isteğe bağlı)"
            maxLength={80}
            defaultValue={state.values?.note ?? ""}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {pending ? "…" : "Ekle"}
          </button>
        </div>

        {(error("amount") || error("category") || error("note")) && (
          <p className="text-sm text-red-600">{error("amount") ?? error("category") ?? error("note")}</p>
        )}

        {state.impact && (
          <ImpactToast key={state.impact.id} days={state.impact.days} goalName={state.impact.goalName} />
        )}
      </form>
    </section>
  );
}