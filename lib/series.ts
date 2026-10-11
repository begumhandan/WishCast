import { addDays, differenceInCalendarDays, isSameDay, subDays } from "date-fns";
import { periodFor, type Period } from "./plan";

type ExpenseLike = { amount: number; category: string; spentAt: Date };

/** Dönemin her günü için toplam harcama: grafik verisi. */
export function dailySeries(period: Period, expenses: ExpenseLike[]) {
  const days = differenceInCalendarDays(period.end, period.start) + 1;
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(period.start, i);
    const amount = expenses
      .filter((expense) => isSameDay(expense.spentAt, date))
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { date, day: date.getDate(), amount };
  });
}

/** Kategori bazında toplamlar, büyükten küçüğe. */
export function categoryTotals(expenses: ExpenseLike[]) {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** offset = 0 içinde bulunulan dönem, -1 bir önceki, -2 iki önceki... */
export function periodAt(now: Date, payday: number, offset: number): Period {
  let period = periodFor(now, payday);
  for (let i = 0; i < Math.abs(Math.min(0, offset)); i++) {
    period = periodFor(subDays(period.start, 1), payday);
  }
  return period;
}
