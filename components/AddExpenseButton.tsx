"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { addExpense } from "@/app/actions";
import { categoryIcon } from "@/lib/categories";
import { CATEGORIES, type FormState } from "@/lib/schemas";
import { buttonPrimary, buttonSecondary, input } from "@/lib/ui";
import ImpactToast from "./ImpactToast";

const INITIAL: FormState = {};

export default function AddExpenseButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(addExpense, INITIAL);
  const error = state.errors?.amount?.[0] ?? state.errors?.category?.[0] ?? state.errors?.note?.[0];
  const selected = state.values?.category ?? CATEGORIES[0];

  // Başarılı kayıttan sonra pencereyi kapat
  useEffect(() => {
    if (state !== INITIAL && !state.errors) {
      dialogRef.current?.close();
    }
  }, [state]);

  return (
    <>
      <button type="button" className={buttonPrimary} onClick={() => dialogRef.current?.showModal()}>
        <Plus size={16} />
        Harcama ekle
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl"
        aria-labelledby="add-expense-title"
      >
        <form action={formAction}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id="add-expense-title" className="text-base font-semibold">Yeni harcama</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Kapat" className="rounded-md p-1 text-muted hover:bg-surface-hover">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Tutar</span>
              <span className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">₺</span>
                <input
                  name="amount"
                  inputMode="decimal"
                  placeholder="0,00"
                  autoFocus
                  defaultValue={state.values?.amount ?? ""}
                  aria-invalid={state.errors?.amount ? true : undefined}
                  className={`${input} h-12 pl-8 text-xl font-semibold tabular-nums ${state.errors?.amount ? "border-negative" : ""}`}
                />
              </span>
            </label>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm font-medium">Kategori</legend>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((category) => {
                  const Icon = categoryIcon(category);
                  return (
                    <label key={category} className="cursor-pointer">
                      <input type="radio" name="category" value={category} defaultChecked={category === selected} className="peer sr-only" />
                      <span className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-line text-xs font-medium text-muted transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:ring-3 peer-focus-visible:ring-accent/30 hover:bg-surface-hover">
                        <Icon size={18} />
                        {category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                Not <span className="font-normal text-muted">(isteğe bağlı)</span>
              </span>
              <input name="note" placeholder="Örn. öğle yemeği" maxLength={80} defaultValue={state.values?.note ?? ""} className={input} />
            </label>

            {error && <p className="text-sm text-negative">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-line bg-panel px-5 py-3">
            <button type="button" className={buttonSecondary} onClick={() => dialogRef.current?.close()}>
              Vazgeç
            </button>
            <button type="submit" className={buttonPrimary} disabled={pending}>
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </dialog>

      {state.impact && <ImpactToast key={state.impact.id} days={state.impact.days} goalName={state.impact.goalName} />}
    </>
  );
}
