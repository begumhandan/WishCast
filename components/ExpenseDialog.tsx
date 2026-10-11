"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { addExpense, updateExpense } from "@/app/actions";
import { categoryIcon } from "@/lib/categories";
import { CATEGORIES, type FormState } from "@/lib/schemas";
import { buttonPrimary, buttonSecondary, input } from "@/lib/ui";
import ImpactToast from "./ImpactToast";

/** Düzenlenecek harcama; tutar form metni olarak ("1.250,5"), tarih "2026-10-11" olarak gelir. */
export type EditableExpense = { id: string; amount: string; category: string; note: string; spentOn: string };

type Props = { mode: "add" } | { mode: "edit"; expense: EditableExpense };

const INITIAL: FormState = {};

/** Yerel tarihi "2026-10-11" biçiminde verir. Yalnızca tarayıcıda, olay anında çağrılır. */
function todayInput() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function ExpenseDialog(props: Props) {
  const editing = props.mode === "edit" ? props.expense : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const action = useMemo(() => (editing ? updateExpense.bind(null, editing.id) : addExpense), [editing]);
  const [state, formAction, pending] = useActionState(action, INITIAL);

  const value = (name: keyof EditableExpense) => state.values?.[name] ?? editing?.[name] ?? "";
  const error = state.errors?.amount?.[0] ?? state.errors?.category?.[0] ?? state.errors?.spentOn?.[0] ?? state.errors?.note?.[0];
  const selected = value("category") || CATEGORIES[0];
  const titleId = editing ? `edit-expense-${editing.id}` : "add-expense-title";

  // Başarılı kayıttan sonra pencereyi kapat
  useEffect(() => {
    if (state.saved) {
      dialogRef.current?.close();
    }
  }, [state]);

  function open() {
    // Tarihi render sırasında değil, açılış anında hesaplıyoruz (sunucu/istemci saat farkı olmasın)
    const today = todayInput();
    if (dateRef.current) {
      dateRef.current.max = today;
      if (!dateRef.current.value) dateRef.current.value = today;
    }
    dialogRef.current?.showModal();
  }

  return (
    <>
      {editing ? (
        <button
          type="button"
          onClick={open}
          aria-label={`${editing.note || editing.category} harcamasını düzenle`}
          className="rounded-md p-1.5 text-subtle transition hover:bg-surface hover:text-ink md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
        >
          <Pencil size={14} />
        </button>
      ) : (
        <button type="button" className={buttonPrimary} onClick={open}>
          <Plus size={16} />
          Harcama ekle
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-left text-ink shadow-2xl"
        aria-labelledby={titleId}
      >
        <form action={formAction}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id={titleId} className="text-base font-semibold">
              {editing ? "Harcamayı düzenle" : "Yeni harcama"}
            </h2>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Kapat" className="rounded-md p-1 text-muted hover:bg-surface-hover">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Tutar</span>
                <span className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">₺</span>
                  <input
                    name="amount"
                    inputMode="decimal"
                    placeholder="0,00"
                    defaultValue={value("amount")}
                    aria-invalid={state.errors?.amount ? true : undefined}
                    className={`${input} h-11 pl-8 text-lg font-semibold tabular-nums ${state.errors?.amount ? "border-negative" : ""}`}
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Tarih</span>
                <input
                  ref={dateRef}
                  type="date"
                  name="spentOn"
                  defaultValue={value("spentOn")}
                  aria-invalid={state.errors?.spentOn ? true : undefined}
                  className={`${input} h-11 w-40 ${state.errors?.spentOn ? "border-negative" : ""}`}
                />
              </label>
            </div>

            <fieldset>
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
              <input name="note" placeholder="Örn. öğle yemeği" maxLength={80} defaultValue={value("note")} className={input} />
            </label>

            {error && <p className="text-sm text-negative">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-line bg-panel px-5 py-3">
            <button type="button" className={buttonSecondary} onClick={() => dialogRef.current?.close()}>
              Vazgeç
            </button>
            <button type="submit" className={buttonPrimary} disabled={pending}>
              {pending ? "Kaydediliyor…" : editing ? "Değişiklikleri kaydet" : "Kaydet"}
            </button>
          </div>
        </form>
      </dialog>

      {state.impact && <ImpactToast key={state.impact.id} days={state.impact.days} goalName={state.impact.goalName} />}
    </>
  );
}
