import { startOfDay, subDays } from "date-fns";
import { periodFor, type Period } from "./plan";

/** İçinde bulunulan dönemden bir önceki maaş dönemi. */
export function previousPeriod(now: Date, payday: number): Period {
  const current = periodFor(now, payday);
  return periodFor(subDays(current.start, 1), payday);
}

/**
 * Önceki dönem kapatılabilir mi?
 * Yalnızca hedef oluşturulduktan SONRA başlayan tam dönemler kapatılabilir.
 * Kullanıcı ayın ortasında katıldıysa o yarım dönemin tüm geliri hedefe aktarılmamalı.
 */
export function isClosable(period: Period, goalCreatedAt: Date): boolean {
  return period.start >= startOfDay(goalCreatedAt);
}

/** Dönem sonunda artan para: gelir − sabit giderler − harcamalar. Negatifse 0. */
export function periodLeftover(args: { income: number; fixedTotal: number; spent: number }): number {
  return Math.max(0, args.income - args.fixedTotal - args.spent);
}

/** Harcamanın hedefi kaç gün geciktirdiği. Aylık birikim yoksa hesaplanamaz (null). */
export function delayInDays(amount: number, monthlySaving: number): number | null {
  if (monthlySaving <= 0) return null;
  const dailySaving = (monthlySaving * 12) / 365;
  return amount / dailySaving;
}

/** 0.4 → "10 saat", 2.3 → "2 gün" */
export function formatDelay(days: number): string {
  if (days < 1) {
    return `${Math.max(1, Math.round(days * 24))} saat`;
  }
  return `${Math.round(days)} gün`;
}