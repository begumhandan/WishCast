import { differenceInCalendarDays, differenceInCalendarMonths } from "date-fns";
import {
  budgetForPeriod,
  dailyAllowance,
  estimateGoalDate,
  monthlySavingNeeded,
  periodFor,
  type Period,
} from "./plan";

export type DashboardInput = {
  now: Date;
  income: number; // kuruş
  payday: number;
  fixedTotal: number; // kuruş
  goal: {
    price: number; // kuruş
    saved: number; // kuruş
    targetMonths: number;
    monthlyInflation: number;
    createdAt: Date;
  };
  spentInPeriod: number; // kuruş
};

export type Dashboard = {
  period: Period;
  monthsLeft: number;
  monthlySaving: number;
  savingRate: number; // tahminde kullanılan aylık birikim (kuruş)
  spendable: number;
  feasible: boolean;
  remaining: number;
  spentInPeriod: number;
  daysLeft: number; // bugün dahil dönemde kalan gün
  allowanceToday: number;
  progress: number; // 0-1
  estimatedDate: Date | null;
};

/** Panoda gösterilecek tüm sayıları hesaplar. Saf fonksiyon: veritabanına dokunmaz. */
export function buildDashboard(input: DashboardInput): Dashboard {
  const { now, income, payday, fixedTotal, goal, spentInPeriod } = input;

  const monthsElapsed = Math.max(0, differenceInCalendarMonths(now, goal.createdAt));
  const monthsLeft = Math.max(1, goal.targetMonths - monthsElapsed);

  const monthlySaving = monthlySavingNeeded({ price: goal.price, saved: goal.saved, months: monthsLeft });
  const { spendable, feasible } = budgetForPeriod({ income, fixed: fixedTotal, saving: monthlySaving });

  const period = periodFor(now, payday);
  const allowanceToday = dailyAllowance({ spendable, spent: spentInPeriod, today: now, period });

  // Hedef bu sürede imkânsızsa, ayırabileceği en fazla parayla en erken tarihi göster
  const savingForEstimate = feasible ? monthlySaving : Math.max(0, income - fixedTotal);
  const estimatedDate = estimateGoalDate({
    price: goal.price,
    saved: goal.saved,
    monthlySaving: savingForEstimate,
    monthlyInflation: goal.monthlyInflation,
    from: now,
  });

  return {
    period,
    monthsLeft,
    monthlySaving,
    savingRate: savingForEstimate,
    spendable,
    feasible,
    remaining: spendable - spentInPeriod,
    spentInPeriod,
    daysLeft: Math.max(0, differenceInCalendarDays(period.end, now) + 1),
    allowanceToday,
    progress: goal.price > 0 ? Math.min(1, goal.saved / goal.price) : 0,
    estimatedDate,
  };
}
