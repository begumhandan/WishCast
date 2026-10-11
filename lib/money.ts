// Para yardımcıları. Tüm tutarlar kuruş cinsinden tamsayıdır (1 ₺ = 100 kuruş).

/**
 * "1.933,33" gibi Türkçe biçimli bir tutarı kuruşa çevirir.
 * Nokta binlik, virgül ondalık ayırıcıdır. Ondalık kısım en fazla 2 hane olabilir.
 * Boş, negatif ya da geçersiz girdide hata fırlatır.
 */
export function parseTL(input: string): number {
  throw new Error("TODO: parseTL");
}

/** Kuruşu "₺1.933,33" biçiminde metne çevirir (Intl.NumberFormat, tr-TR). */
export function formatTL(kurus: number): string {
  throw new Error("TODO: formatTL");
}