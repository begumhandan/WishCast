import { format, isSameDay, isValid, parse, setHours, startOfDay, subYears } from "date-fns";

export type SpentAtResult = { ok: true; date: Date } | { ok: false; error: string };

/** Date → "2026-10-11" (form alanı için, yerel saat) */
export function toDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Formdaki tarihi harcama zamanına çevirir.
 * - Boş ya da bugün → şu an (saat bilgisi korunur)
 * - Geçmiş bir gün → o günün 12:00'si
 * - Gelecek ya da 1 yıldan eski → hata
 */
export function resolveSpentAt(input: string | undefined, now: Date): SpentAtResult {
  if (!input) {
    return { ok: true, date: now };
  }

  const date = parse(input, "yyyy-MM-dd", now);
  if (!isValid(date)) {
    return { ok: false, error: "Geçerli bir tarih seç" };
  }
  if (isSameDay(date, now)) {
    return { ok: true, date: now };
  }
  if (date > startOfDay(now)) {
    return { ok: false, error: "Gelecekteki bir tarihe harcama girilemez" };
  }
  if (date < subYears(startOfDay(now), 1)) {
    return { ok: false, error: "En fazla 1 yıl öncesine harcama girilebilir" };
  }
  return { ok: true, date: setHours(date, 12) };
}
