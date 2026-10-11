// Para yardımcıları. Tüm tutarlar kuruş cinsinden tamsayıdır (1 ₺ = 100 kuruş).

const tlFormatter = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
const TL_PATTERN = /^(\d+|\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/;
const tlInputFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

/**
 * "1.933,33" gibi Türkçe biçimli bir tutarı kuruşa çevirir.
 * Nokta binlik, virgül ondalık ayırıcıdır. Ondalık kısım en fazla 2 hane olabilir.
 * Boş, negatif ya da geçersiz girdide hata fırlatır.
 */
export function parseTL(input: string): number {
  const text = input.trim();
  const match = TL_PATTERN.exec(text);
if (!match) {
  throw new Error(`Geçersiz tutar: "${input}"`);
}

const [, wholePart, fractionPart = ""] = match;
const lira = Number(wholePart.replace(/\./g, ""));
const kurus = Number(fractionPart.padEnd(2, "0"));

return lira * 100 + kurus;
}

/** Kuruşu "₺1.933,33" biçiminde metne çevirir (Intl.NumberFormat, tr-TR). */
export function formatTL(kurus: number): string {
  return tlFormatter.format(kurus / 100);
}

/** Kuruşu form alanında gösterilecek, parseTL'in geri okuyabileceği metne çevirir: 1250 → "12,5" */
export function toTLInput(kurus: number): string {
  return tlInputFormatter.format(kurus / 100);
}