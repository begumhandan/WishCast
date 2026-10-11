import { deleteExpense } from "@/app/actions";
import { formatTL } from "@/lib/money";
import { formatTime } from "@/lib/dates";

type Expense = { id: string; amount: number; category: string; note: string | null; spentAt: Date };

export default function TodayExpenses({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section className="rounded-2xl border border-gray-200 p-6 text-left">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Bugünkü harcamalar</h2>
        <span className="text-sm text-gray-500">{formatTL(total)}</span>
      </div>

      {expenses.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">Bugün henüz harcama yok. 🎉</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {expense.category}
                  {expense.note && <span className="font-normal text-gray-500"> · {expense.note}</span>}
                </p>
                <p className="text-xs text-gray-400">{formatTime(expense.spentAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatTL(expense.amount)}</span>
                <form action={deleteExpense.bind(null, expense.id)}>
                  <button type="submit" className="text-sm text-gray-400 hover:text-red-600" aria-label="Sil">
                    ✕
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}