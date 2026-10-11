import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "./db";
import { buildDashboard } from "./dashboard";

/**
 * Panonun ihtiyaç duyduğu verileri veritabanından okur ve hesaplar.
 * Profil ya da hedef eksikse null döner.
 */
export async function getDashboardData(userId: string, now: Date) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      monthlyIncome: true,
      payday: true,
      fixedExpenses: { select: { amount: true } },
      goals: { take: 1 },
    },
  });

  const goal = user?.goals[0];
  if (!user?.monthlyIncome || !user.payday || !goal) {
    return null;
  }

  const fixedTotal = user.fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Önce dönemi bulmak için hesaplamayı harcamasız yapıyoruz, sonra dönem harcamalarını çekiyoruz
  const { period } = buildDashboard({
    now,
    income: user.monthlyIncome,
    payday: user.payday,
    fixedTotal,
    goal,
    spentInPeriod: 0,
  });

  const [periodSum, todayExpenses] = await Promise.all([
    prisma.expense.aggregate({
      where: { userId, spentAt: { gte: period.start, lte: endOfDay(period.end) } },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({
      where: { userId, spentAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      orderBy: { spentAt: "desc" },
      select: { id: true, amount: true, category: true, note: true, spentAt: true },
    }),
  ]);

  const dashboard = buildDashboard({
    now,
    income: user.monthlyIncome,
    payday: user.payday,
    fixedTotal,
    goal,
    spentInPeriod: periodSum._sum.amount ?? 0,
  });

  return { goal, dashboard, todayExpenses };
}