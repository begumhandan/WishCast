import { describe, it, expect } from "vitest";
import {
  monthlySavingNeeded, budgetForPeriod, periodFor, dailyAllowance, estimateGoalDate,
} from "../lib/plan";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe("monthlySavingNeeded", () => {
  it("kalan tutarı aylara böler, yukarı yuvarlar", () => {
    expect(monthlySavingNeeded({ price: 6_000_000, saved: 1_000_000, months: 6 })).toBe(833_334);
  });
  it("hedefe zaten ulaşıldıysa 0", () => {
    expect(monthlySavingNeeded({ price: 6_000_000, saved: 6_500_000, months: 3 })).toBe(0);
  });
  it("ay sayısı pozitif olmalı", () => {
    expect(() => monthlySavingNeeded({ price: 1, saved: 0, months: 0 })).toThrow(RangeError);
  });
});

describe("budgetForPeriod", () => {
  it("harcanabilir tutarı hesaplar", () => {
    expect(budgetForPeriod({ income: 4_000_000, fixed: 1_800_000, saving: 833_334 }))
      .toEqual({ spendable: 1_366_666, feasible: true });
  });
  it("gelir yetmiyorsa feasible = false", () => {
    expect(budgetForPeriod({ income: 2_000_000, fixed: 1_800_000, saving: 833_334 }))
      .toEqual({ spendable: -633_334, feasible: false });
  });
});

describe("periodFor (maaş dönemi)", () => {
  it("maaş gününden önce → önceki dönem", () => {
    expect(periodFor(d(2026, 10, 10), 15)).toEqual({ start: d(2026, 9, 15), end: d(2026, 10, 14) });
  });
  it("maaş günü → yeni dönem başlar", () => {
    expect(periodFor(d(2026, 10, 15), 15)).toEqual({ start: d(2026, 10, 15), end: d(2026, 11, 14) });
  });
  it("yıl geçişi", () => {
    expect(periodFor(d(2027, 1, 5), 15)).toEqual({ start: d(2026, 12, 15), end: d(2027, 1, 14) });
  });
  it("maaş günü 31, şubat kısa → ayın son gününe kayar", () => {
    expect(periodFor(d(2026, 2, 10), 31)).toEqual({ start: d(2026, 1, 31), end: d(2026, 2, 27) });
    expect(periodFor(d(2026, 2, 28), 31)).toEqual({ start: d(2026, 2, 28), end: d(2026, 3, 30) });
  });
  it("maaş günü ayın 1'i", () => {
    expect(periodFor(d(2027, 1, 1), 1)).toEqual({ start: d(2027, 1, 1), end: d(2027, 1, 31) });
  });
});

describe("dailyAllowance", () => {
  const period = { start: d(2026, 9, 15), end: d(2026, 10, 14) };
  it("kalanı bugün dahil kalan günlere böler (aşağı yuvarlar)", () => {
    expect(dailyAllowance({ spendable: 1_366_666, spent: 400_000, today: d(2026, 10, 10), period }))
      .toBe(193_333);
  });
  it("dönemin son günü → kalanın tamamı", () => {
    expect(dailyAllowance({ spendable: 1_000_000, spent: 900_000, today: d(2026, 10, 14), period }))
      .toBe(100_000);
  });
  it("bütçe aşıldıysa 0", () => {
    expect(dailyAllowance({ spendable: 1_366_666, spent: 2_000_000, today: d(2026, 10, 10), period }))
      .toBe(0);
  });
});

describe("estimateGoalDate", () => {
  const from = d(2026, 10, 10);
  it("fiyat artışı yoksa", () => {
    expect(estimateGoalDate({ price: 6_000_000, saved: 1_000_000, monthlySaving: 1_000_000, monthlyInflation: 0, from }))
      .toEqual(d(2027, 3, 10));
  });
  it("aylık %2 fiyat artışı hedefi 1 ay öteler", () => {
    expect(estimateGoalDate({ price: 6_000_000, saved: 1_000_000, monthlySaving: 1_000_000, monthlyInflation: 0.02, from }))
      .toEqual(d(2027, 4, 10));
  });
  it("birikim zaten yeterliyse bugün", () => {
    expect(estimateGoalDate({ price: 500_000, saved: 600_000, monthlySaving: 0, monthlyInflation: 0.03, from }))
      .toEqual(from);
  });
  it("fiyat birikimden hızlı artıyorsa null", () => {
    expect(estimateGoalDate({ price: 6_000_000, saved: 0, monthlySaving: 100_000, monthlyInflation: 0.05, from }))
      .toBeNull();
  });
});