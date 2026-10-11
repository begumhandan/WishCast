import { describe, it, expect } from "vitest";
import { buildDashboard, type DashboardInput } from "../lib/dashboard";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const base: DashboardInput = {
  now: d(2026, 10, 10),
  income: 4_000_000,
  payday: 15,
  fixedTotal: 1_800_000,
  goal: { price: 6_000_000, saved: 1_000_000, targetMonths: 6, monthlyInflation: 0, createdAt: d(2026, 10, 1) },
  spentInPeriod: 400_000,
};

describe("buildDashboard", () => {
  it("planlanan hedef için bütçe ve günlük limiti hesaplar", () => {
    const result = buildDashboard(base);
    expect(result.monthsLeft).toBe(6);
    expect(result.monthlySaving).toBe(833_334);
    expect(result.spendable).toBe(1_366_666);
    expect(result.feasible).toBe(true);
    expect(result.remaining).toBe(966_666);
    expect(result.allowanceToday).toBe(193_333);
    expect(result.period).toEqual({ start: d(2026, 9, 15), end: d(2026, 10, 14) });
    expect(result.progress).toBeCloseTo(1 / 6);
  });

  it("geçen aylar kalan süreden düşülür", () => {
    const result = buildDashboard({ ...base, now: d(2026, 12, 10) });
    expect(result.monthsLeft).toBe(4);
    expect(result.monthlySaving).toBe(1_250_000);
  });

  it("süre dolduysa en az 1 ay kalmış sayılır", () => {
    const result = buildDashboard({ ...base, now: d(2027, 9, 10) });
    expect(result.monthsLeft).toBe(1);
  });

  it("gelir yetmiyorsa en erken mümkün tarihi gösterir", () => {
    const result = buildDashboard({ ...base, income: 2_000_000 });
    expect(result.feasible).toBe(false);
    expect(result.allowanceToday).toBe(0);
    // Ayda en fazla 200.000 kuruş ayırabilir: 5.000.000 / 200.000 = 25 ay
    expect(result.estimatedDate).toEqual(d(2028, 11, 10));
  });

  it("planlanan birikimle tahmini tarih hedef süresine denk gelir", () => {
    const result = buildDashboard(base);
    expect(result.estimatedDate).toEqual(d(2027, 4, 10));
  });
});