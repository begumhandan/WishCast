// WishCast iş mantığı. SAF fonksiyonlar: veritabanı, framework ya da Date.now() kullanmaz.
// Tüm tutarlar kuruş cinsinden tamsayıdır.
import { addMonths, differenceInCalendarDays, getDaysInMonth, startOfDay, subDays } from "date-fns";

/** Verilen ayın gerçek maaş günü. Maaş günü o ayda yoksa ayın son günü. */
function paydayIn(year: number, month: number, payday: number): Date {
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  return new Date(year, month, Math.min(payday, daysInMonth));
}

export type Period = { start: Date; end: Date };

/** Kalan tutarı kalan aylara böler, yukarı yuvarlar. months <= 0 ise RangeError. */
export function monthlySavingNeeded(args: { price: number; saved: number; months: number }): number {
  const { price, saved, months } = args;

if (months <= 0) {
  throw new RangeError("Ay sayısı pozitif olmalı");
}

const remaining = price - saved;
if (remaining <= 0) {
  return 0;
}

return Math.ceil(remaining / months);
}

/** Harcanabilir = gelir − sabit giderler − aylık birikim. Negatifse feasible = false. */
export function budgetForPeriod(args: { income: number; fixed: number; saving: number }): {
  spendable: number;
  feasible: boolean;
} {
  const { income, fixed, saving } = args;
const spendable = income - fixed - saving;

return { spendable, feasible: spendable >= 0 };
}

/**
 * Verilen tarihin içinde bulunduğu maaş dönemini döndürür.
 * start: dönemin ilk günü (maaş günü), end: bir sonraki maaş gününden bir önceki gün.
 * Maaş günü ayın gün sayısından büyükse ayın son gününe kayar.
 */
export function periodFor(date: Date, payday: number): Period {
  const today = startOfDay(date);
  const year = today.getFullYear();
  const month = today.getMonth();

  const thisMonthsPayday = paydayIn(year, month, payday);
  const start = today >= thisMonthsPayday
    ? thisMonthsPayday
    : paydayIn(year, month - 1, payday);

  const nextPayday = paydayIn(start.getFullYear(), start.getMonth() + 1, payday);
  return { start, end: subDays(nextPayday, 1) };
}

/** Kalan parayı bugün dahil dönemde kalan günlere böler, aşağı yuvarlar. En az 0. */
export function dailyAllowance(args: { spendable: number; spent: number; today: Date; period: Period }): number {
  const { spendable, spent, today, period } = args;

  const daysLeft = differenceInCalendarDays(period.end, today) + 1;
  const remaining = spendable - spent;

  if (remaining <= 0 || daysLeft <= 0) {
    return 0;
  }

  return Math.floor(remaining / daysLeft);
}

/** Tahmin en fazla bu kadar ay ileriye bakar (120 ay = 10 yıl). */
const MAX_MONTHS = 120;

/**
 * Ay ay simülasyon: her ay birikim += monthlySaving, fiyat *= (1 + monthlyInflation).
 * Birikimin fiyata ulaştığı ilk ayın tarihini döndürür. 120 ayda ulaşılamıyorsa null.
 */
export function estimateGoalDate(args: {
  price: number;
  saved: number;
  monthlySaving: number;
  monthlyInflation: number;
  from: Date;
}): Date | null {
  const { price, saved, monthlySaving, monthlyInflation, from } = args;

for (let month = 0; month <= MAX_MONTHS; month++) {
  const savedThen = saved + monthlySaving * month;
  const priceThen = price * (1 + monthlyInflation) ** month;

  if (savedThen >= priceThen) {
    return addMonths(from, month);
  }
}

return null;
}