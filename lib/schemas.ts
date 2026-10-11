import { z } from "zod";
import { parseTL } from "./money";

/** Server Action'ların forma geri döndürdüğü durum. */
export type FormState = {
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
  /** Kayıt başarılıysa true (pencereyi kapatmak için) */
  saved?: boolean;
  /** Harcama eklendiğinde: hedefi kaç gün geciktirdiği */
  impact?: { id: number; goalName: string; days: number | null; newDate: string | null };
};

/** Onboarding formundaki sabit gider satırları. */
export const FIXED_EXPENSES = [
  { key: "rent", label: "Kira" },
  { key: "bills", label: "Faturalar" },
  { key: "transport", label: "Ulaşım" },
  { key: "subscriptions", label: "Abonelikler" },
  { key: "other", label: "Diğer" },
] as const;

/** Zorunlu TL alanı: "40.000" → 4000000 kuruş */
function tlField(label: string) {
  return z.string().trim().transform((value, ctx) => {
    try {
      return parseTL(value);
    } catch {
      ctx.addIssue({ code: "custom", message: `${label} için geçerli bir tutar gir (ör. 40.000 veya 1.250,50)` });
      return z.NEVER;
    }
  });
}

/** İsteğe bağlı TL alanı: boş bırakılırsa 0 */
function optionalTlField(label: string) {
  return z.string().trim().transform((value, ctx) => {
    if (value === "") return 0;
    try {
      return parseTL(value);
    } catch {
      ctx.addIssue({ code: "custom", message: `${label} için geçerli bir tutar gir (ör. 5.000)` });
      return z.NEVER;
    }
  });
}

export const profileSchema = z.object({
  monthlyIncome: tlField("Aylık gelir").refine((v) => v > 0, "Aylık gelir 0'dan büyük olmalı"),
  payday: z.coerce
    .number({ error: "Maaş günü 1 ile 31 arasında bir sayı olmalı" })
    .int("Maaş günü tam sayı olmalı")
    .min(1, "Maaş günü 1 ile 31 arasında olmalı")
    .max(31, "Maaş günü 1 ile 31 arasında olmalı"),
  rent: optionalTlField("Kira"),
  bills: optionalTlField("Faturalar"),
  transport: optionalTlField("Ulaşım"),
  subscriptions: optionalTlField("Abonelikler"),
  other: optionalTlField("Diğer"),
});

export const goalSchema = z.object({
  name: z.string().trim().min(1, "Hedefine bir isim ver").max(60, "İsim en fazla 60 karakter olabilir"),
  price: tlField("Fiyat").refine((v) => v > 0, "Fiyat 0'dan büyük olmalı"),
  saved: optionalTlField("Mevcut birikim"),
  targetMonths: z.coerce
    .number({ error: "Süre 1 ile 120 ay arasında bir sayı olmalı" })
    .int("Süre tam sayı olmalı")
    .min(1, "Süre en az 1 ay olmalı")
    .max(120, "Süre en fazla 120 ay olabilir"),
  inflationPercent: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === "") return 0;
      const percent = Number(value.replace(",", "."));
      if (!Number.isFinite(percent) || percent < 0 || percent > 50) {
        ctx.addIssue({ code: "custom", message: "Aylık fiyat artışı 0 ile 50 arasında bir yüzde olmalı (ör. 2,5)" });
        return z.NEVER;
      }
      return percent / 100;
    }),
});

/** Hızlı harcama ekleme kategorileri. */
export const CATEGORIES = ["Yemek", "Market", "Ulaşım", "Eğlence", "Alışveriş", "Diğer"] as const;

export const expenseSchema = z.object({
  amount: tlField("Tutar").refine((v) => v > 0, "Tutar 0'dan büyük olmalı"),
  category: z.enum(CATEGORIES, { error: "Bir kategori seç" }),
  note: z.string().trim().max(80, "Not en fazla 80 karakter olabilir").optional(),
  /** "2026-10-11" biçiminde; boşsa bugün. Tarih aralığı action içinde kontrol edilir. */
  spentOn: z.string().trim().optional(),
});
