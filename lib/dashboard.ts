import { differenceInCalendarDays, differenceInCalendarMonths } from "date-fns";
import { forecastGoalDate } from "./forecast";
import { budgetForPeriod, dailyAllowance, monthlySavingNeeded, periodFor, type Period } from "./plan";

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
  spentInPeriod: number; // kuruş, bugün dahil
  spentToday?: number; // kuruş
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
  spentToday: number;
  daysLeft: number; // bugün dahil dönemde kalan gün
  allowanceToday: number;
  progress: number; // 0-1
  estimatedDate: Date | null;
  /** Bu dönem tam planlandığı gibi harcasaydın tahmini tarih */
  plannedDate: Date | null;
  /** Bu dönemin fazla harcaması (kuruş) */
  overspent: number;
  /** Bu dönem sonunda tahminen birikecek para (kuruş) */
  projectedSaving: number;
};

/** Panoda gösterilecek tüm sayıları hesaplar. Saf fonksiyon: veritabanına dokunmaz. */
export function buildDashboard(input: DashboardInput): Dashboard {
  const { now, income, payday, fixedTotal, goal, spentInPeriod, spentToday = 0 } = input;

  const monthsElapsed = Math.max(0, differenceInCalendarMonths(now, goal.createdAt));
  const monthsLeft = Math.max(1, goal.targetMonths - monthsElapsed);

  const monthlySaving = monthlySavingNeeded({ price: goal.price, saved: goal.saved, months: monthsLeft });
  const { spendable, feasible } = budgetForPeriod({ income, fixed: fixedTotal, saving: monthlySaving });

  const period = periodFor(now, payday);
  const allowanceToday = dailyAllowance({ spendable, spent: spentInPeriod, today: now, period, spentToday });

  const periodDays = differenceInCalendarDays(period.end, period.start) + 1;
  const daysLeft = Math.max(0, differenceInCalendarDays(period.end, now) + 1);

  // Hedef bu sürede imkânsızsa, ayırabileceği en fazla parayla en erken tarihi göster
  const savingForEstimate = feasible ? monthlySaving : Math.max(0, income - fixedTotal);

  // Bu dönem sonunda ne kadar birikecek?
  // Bugüne kadar harcadığın gerçek tutar + kalan günler (yarından itibaren) için planlanan günlük bütçe.
  // Böylece eklediğin HER harcama tahmini birikimi ve dolayısıyla tarihi etkiler.
  const plannedDaily = Math.max(0, spendable) / periodDays;
  const projectedSpend = spentInPeriod + plannedDaily * Math.max(0, daysLeft - 1);
  const projectedSaving = Math.max(0, income - fixedTotal - projectedSpend);
  const plannedSaving = Math.max(0, income - fixedTotal - Math.max(0, spendable));

  const forecast = (saving: number) =>
    forecastGoalDate({
      price: goal.price,
      saved: goal.saved,
      monthlySaving: savingForEstimate,
      monthlyInflation: goal.monthlyInflation,
      from: now,
      currentPeriod: { daysLeft, saving },
    });
  const estimatedDate = forecast(projectedSaving);
  const plannedDate = forecast(plannedSaving);
  const overspent = Math.max(0, spentInPeriod - Math.max(0, spendable));

  return {
    period,
    monthsLeft,
    monthlySaving,
    savingRate: savingForEstimate,
    spendable,
    feasible,
    remaining: spendable - spentInPeriod,
    spentInPeriod,
    spentToday,
    daysLeft,
    allowanceToday,
    progress: goal.price > 0 ? Math.min(1, goal.saved / goal.price) : 0,
    estimatedDate,
    plannedDate,
    overspent,
    projectedSaving: Math.round(projectedSaving),
  };
}
