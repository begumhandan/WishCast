import { describe, it, expect } from "vitest";
import { categoryTotals, dailySeries, periodAt } from "../lib/series";

const d = (y: number, m: number, day: number, h = 12) => new Date(y, m - 1, day, h);

describe("dailySeries", () => {
  const period = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 3) };
  it("dönemin her günü için bir satır üretir ve aynı günü toplar", () => {
    const series = dailySeries(period, [
      { amount: 1_000, category: "Yemek", spentAt: d(2026, 10, 1, 9) },
      { amount: 2_500, category: "Market", spentAt: d(2026, 10, 1, 20) },
      { amount: 700, category: "Yemek", spentAt: d(2026, 10, 3) },
    ]);
    expect(series.map((row) => [row.day, row.amount])).toEqual([
      [1, 3_500],
      [2, 0],
      [3, 700],
    ]);
  });
});

describe("categoryTotals", () => {
  it("kategorileri toplar ve büyükten küçüğe sıralar", () => {
    expect(
      categoryTotals([
        { amount: 100, category: "Yemek", spentAt: d(2026, 10, 1) },
        { amount: 500, category: "Market", spentAt: d(2026, 10, 1) },
        { amount: 300, category: "Yemek", spentAt: d(2026, 10, 2) },
      ]),
    ).toEqual([
      { category: "Market", amount: 500 },
      { category: "Yemek", amount: 400 },
    ]);
  });
});

describe("periodAt", () => {
  const now = d(2026, 10, 20);
  it("0 içinde bulunulan dönem", () => {
    expect(periodAt(now, 15, 0)).toEqual({ start: new Date(2026, 9, 15), end: new Date(2026, 10, 14) });
  });
  it("-2 iki önceki dönem", () => {
    expect(periodAt(now, 15, -2)).toEqual({ start: new Date(2026, 7, 15), end: new Date(2026, 8, 14) });
  });
  it("pozitif offset gelecek dönem vermez, mevcut dönemde kalır", () => {
    expect(periodAt(now, 15, 3)).toEqual(periodAt(now, 15, 0));
  });
});
