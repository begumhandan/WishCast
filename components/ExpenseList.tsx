import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/app/actions";
import { categoryIcon } from "@/lib/categories";
import { formatShortDate, formatTime } from "@/lib/dates";
import { toDateInput } from "@/lib/expense-date";
import { formatTL, toTLInput } from "@/lib/money";
import ExpenseDialog from "./ExpenseDialog";

type Expense = { id: string; amount: number; category: string; note: string | null; spentAt: Date };

export default function ExpenseList({ expenses, empty = "Henüz harcama yok." }: { expenses: Expense[]; empty?: string }) {
  if (expenses.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-muted">{empty}</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {expenses.map((expense) => {
        const Icon = categoryIcon(expense.category);
        return (
          <li key={expense.id} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-hover">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted">
              <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{expense.note || expense.category}</p>
              <p className="text-xs text-muted">
                {expense.category} · {formatShortDate(expense.spentAt)}, {formatTime(expense.spentAt)}
              </p>
            </div>
            <span className="text-sm font-medium tabular-nums">−{formatTL(expense.amount)}</span>
            <ExpenseDialog
              mode="edit"
              expense={{
                id: expense.id,
                amount: toTLInput(expense.amount),
                category: expense.category,
                note: expense.note ?? "",
                spentOn: toDateInput(expense.spentAt),
              }}
            />
            <form action={deleteExpense.bind(null, expense.id)}>
              <button
                type="submit"
                aria-label={`${expense.note || expense.category} harcamasını sil`}
                className="rounded-md p-1.5 text-subtle opacity-100 transition hover:bg-negative-soft hover:text-negative md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
