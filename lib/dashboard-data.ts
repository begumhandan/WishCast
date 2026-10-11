import { differenceInCalendarDays, endOfDay, isSameDay, isWithinInterval } from "date-fns";
import { prisma } from "./db";
import { buildDashboard } from "./dashboard";
import { isClosable, periodLeftover, previousPeriod } from "./closing";
import { periodFor } from "./plan";
import { categoryTotals, dailySeries } from "./series";

/** Kullanıcının profilini ve hedefini okur. Eksikse null döner. */
export async function loadProfile(userId: string) {
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

  return {
    income: user.monthlyIncome,
    payday: user.payday,
    fixedTotal: user.fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    goal,
  };
}

type Profile = NonNullable<Awaited<ReturnType<typeof loadProfile>>>;

async function sumExpenses(userId: string, start: Date, end: Date) {
  const result = await prisma.expense.aggregate({
    where: { userId, spentAt: { gte: start, lte: endOfDay(end) } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

/** Kapatılmayı bekleyen önceki dönem ve o dönemde artan para. Yoksa null. */
export async function getPendingClose(userId: string, profile: Profile, now: Date) {
  const period = previousPeriod(now, profile.payday);
  if (!isClosable(period, profile.goal.createdAt)) {
    return null;
  }

  const alreadyClosed = await prisma.periodClose.findUnique({
    where: { userId_periodStart: { userId, periodStart: period.start } },
    select: { id: true },
  });
  if (alreadyClosed) {
    return null;
  }

  const spent = await sumExpenses(userId, period.start, period.end);
  const leftover = periodLeftover({ income: profile.income, fixedTotal: profile.fixedTotal, spent });
  return { period, leftover };
}

/** Panonun ihtiyaç duyduğu tüm verileri okur ve hesaplar. Profil ya da hedef eksikse null döner. */
export async function getDashboardData(userId: string, now: Date) {
  const profile = await loadProfile(userId);
  if (!profile) {
    return null;
  }

  const input = { now, ...profile, spentInPeriod: 0 };

  // Önce dönemi bulmak için hesaplamayı harcamasız yapıyoruz, sonra dönem harcamalarını çekiyoruz
  const { period } = buildDashboard(input);

  const [periodExpenses, pendingClose] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, spentAt: { gte: period.start, lte: endOfDay(period.end) } },
      orderBy: { spentAt: "desc" },
      select: { id: true, amount: true, category: true, note: true, spentAt: true },
    }),
    getPendingClose(userId, profile, now),
  ]);

  const spentInPeriod = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const spentToday = periodExpenses
    .filter((expense) => isSameDay(expense.spentAt, now))
    .reduce((sum, expense) => sum + expense.amount, 0);
  const dashboard = buildDashboard({ ...input, spentInPeriod, spentToday });

  return {
    goal: profile.goal,
    dashboard,
    pendingClose,
    daily: dailySeries(period, periodExpenses),
    categories: categoryTotals(periodExpenses),
    recentExpenses: periodExpenses.slice(0, 6),
  };
}

/**
 * Yeni eklenen bir harcamanın tahmini tarihi kaç gün öteleği.
 * Panodaki hesabın aynısını harcamadan önce ve sonra yapıp farkı alır,
 * böylece bildirimdeki sayı ile kartta görünen tarih her zaman tutarlıdır.
 */
export async function expenseImpact(userId: string, amount: number, spentAt: Date, now: Date) {
  const profile = await loadProfile(userId);
  if (!profile) return null;

  const period = periodFor(now, profile.payday);
  if (!isWithinInterval(spentAt, { start: period.start, end: endOfDay(period.end) })) {
    return null; // eski bir döneme eklenen harcama bu dönemin tahminini etkilemez
  }

  const expenses = await prisma.expense.findMany({
    where: { userId, spentAt: { gte: period.start, lte: endOfDay(period.end) } },
    select: { amount: true, spentAt: true },
  });
  const spentInPeriod = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const spentToday = expenses.filter((e) => isSameDay(e.spentAt, now)).reduce((sum, e) => sum + e.amount, 0);
  const wasToday = isSameDay(spentAt, now);

  const after = buildDashboard({ now, ...profile, spentInPeriod, spentToday });
  const before = buildDashboard({
    now,
    ...profile,
    spentInPeriod: spentInPeriod - amount,
    spentToday: wasToday ? spentToday - amount : spentToday,
  });

  if (!after.estimatedDate) {
    return { goalName: profile.goal.name, days: null, newDate: null };
  }
  const days = before.estimatedDate ? differenceInCalendarDays(after.estimatedDate, before.estimatedDate) : 0;
  return { goalName: profile.goal.name, days, newDate: after.estimatedDate.toISOString() };
}
