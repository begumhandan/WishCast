import { endOfDay } from "date-fns";
import { prisma } from "./db";
import { categoryTotals, periodAt } from "./series";

/** Seçilen dönemin harcamaları. offset: 0 bu dönem, -1 önceki dönem... category: isteğe bağlı filtre. */
export async function getHistoryData(userId: string, now: Date, offset: number, category?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { payday: true } });
  if (!user?.payday) {
    return null;
  }

  const period = periodAt(now, user.payday, offset);
  const expenses = await prisma.expense.findMany({
    where: { userId, spentAt: { gte: period.start, lte: endOfDay(period.end) } },
    orderBy: { spentAt: "desc" },
    select: { id: true, amount: true, category: true, note: true, spentAt: true },
  });

  const categories = categoryTotals(expenses);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const visible = category ? expenses.filter((expense) => expense.category === category) : expenses;

  return { period, categories, total, expenses: visible, count: expenses.length };
}
