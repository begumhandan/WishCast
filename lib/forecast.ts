import { addDays } from "date-fns";

/** Ortalama bir aydaki gün sayısı (365,25 / 12). */
export const DAYS_PER_MONTH = 30.44;
const MAX_DAYS = 3650; // 10 yıl

/**
 * Hedefe ulaşılacak günü GÜN GÜN hesaplar.
 *
 * - İçinde bulunulan dönemin kalan `currentPeriod.daysLeft` günü boyunca
 *   `currentPeriod.saving` kadar birikir (doğrusal olarak).
 * - Sonrasında her ay `monthlySaving` kadar birikir.
 * - Fiyat her ay `monthlyInflation` oranında (bileşik) artar.
 *
 * 10 yıl içinde ulaşılamıyorsa null.
 */
export function forecastGoalDate(args: {
  price: number;
  saved: number;
  monthlySaving: number;
  monthlyInflation: number;
  from: Date;
  currentPeriod: { daysLeft: number; saving: number };
}): Date | null {
  const { price, saved, monthlySaving, monthlyInflation, from, currentPeriod } = args;
  const { daysLeft, saving } = currentPeriod;

  for (let day = 0; day <= MAX_DAYS; day++) {
    const accrued =
      daysLeft > 0 && day <= daysLeft
        ? (saving * day) / daysLeft
        : saving + (monthlySaving * (day - Math.max(0, daysLeft))) / DAYS_PER_MONTH;
    const priceThen = price * (1 + monthlyInflation) ** (day / DAYS_PER_MONTH);

    if (saved + accrued >= priceThen) {
      return addDays(from, day);
    }
  }
  return null;
}
