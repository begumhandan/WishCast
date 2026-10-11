// WishCast iş mantığı. SAF fonksiyonlar: veritabanı, framework ya da Date.now() kullanmaz.
// Tüm tutarlar kuruş cinsinden tamsayıdır.

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
  throw new Error("TODO: periodFor");
}

/** Kalan parayı bugün dahil dönemde kalan günlere böler, aşağı yuvarlar. En az 0. */
export function dailyAllowance(args: { spendable: number; spent: number; today: Date; period: Period }): number {
  throw new Error("TODO: dailyAllowance");
}

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
  throw new Error("TODO: estimateGoalDate");
}