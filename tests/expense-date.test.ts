import { describe, it, expect } from "vitest";
import { resolveSpentAt, toDateInput } from "../lib/expense-date";

const now = new Date(2026, 9, 11, 18, 30); // 11 Ekim 2026, 18:30

describe("resolveSpentAt", () => {
  it("boş girdi → şu an", () => {
    expect(resolveSpentAt("", now)).toEqual({ ok: true, date: now });
  });
  it("bugün → şu an (saat korunur)", () => {
    expect(resolveSpentAt("2026-10-11", now)).toEqual({ ok: true, date: now });
  });
  it("geçmiş gün → o günün 12:00'si", () => {
    expect(resolveSpentAt("2026-10-09", now)).toEqual({ ok: true, date: new Date(2026, 9, 9, 12) });
  });
  it("yarın → hata", () => {
    expect(resolveSpentAt("2026-10-12", now).ok).toBe(false);
  });
  it("1 yıldan eski → hata", () => {
    expect(resolveSpentAt("2025-10-10", now).ok).toBe(false);
  });
  it("tam 1 yıl önce → kabul", () => {
    expect(resolveSpentAt("2025-10-11", now).ok).toBe(true);
  });
  it("geçersiz metin → hata", () => {
    expect(resolveSpentAt("abc", now).ok).toBe(false);
  });
});

it("toDateInput yerel tarihi yazar", () => {
  expect(toDateInput(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
});
