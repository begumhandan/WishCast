import { describe, it, expect } from "vitest";
import { differenceInCalendarDays } from "date-fns";
import { dailyAllowance } from "../lib/plan";
import { buildDashboard, type DashboardInput } from "../lib/dashboard";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe("dailyAllowance: bugün harcanan tamamen düşülür", () => {
  const period = { start: d(2026, 9, 15), end: d(2026, 10, 14) };

  it("bugün harcama yoksa eskisiyle aynı sonuç", () => {
    expect(dailyAllowance({ spendable: 1_366_666, spent: 400_000, today: d(2026, 10, 10), period })).toBe(193_333);
  });

  it("bugün 1.000 ₺ harcadıysan bugünkü limit 1.000 ₺ azalır", () => {
    // Günün başında: (1.366.666 − 300.000) / 5 = 213.333 → bugün 100.000 harcandı → 113.333
    expect(
      dailyAllowance({ spendable: 1_366_666, spent: 400_000, spentToday: 100_000, today: d(2026, 10, 10), period }),
    ).toBe(113_333);
  });

  it("bugünkü bütçeyi aştıysan 0", () => {
    expect(
      dailyAllowance({ spendable: 1_366_666, spent: 600_000, spentToday: 300_000, today: d(2026, 10, 10), period }),
    ).toBe(0);
  });
});

describe("buildDashboard: her harcama tahmini tarihi etkiler", () => {
  const input: DashboardInput = {
    now: d(2026, 10, 10), // dönem 15 Eyl – 14 Eki (30 gün), 5 gün kaldı
    income: 4_000_000,
    payday: 15,
    fixedTotal: 1_800_000,
    goal: { price: 6_000_000, saved: 1_000_000, targetMonths: 6, monthlyInflation: 0, createdAt: d(2026, 10, 1) },
    spentInPeriod: 0,
  };
  const at = (spentInPeriod: number) => buildDashboard({ ...input, spentInPeriod });

  it("tam plana göre harcarsan tahmin = plan", () => {
    // Bütçe 1.366.666 / 30 gün; kalan 4 gün için planlanan pay düşülünce bugüne kadar 1.184.444 harcamak "planda" demek
    const result = at(1_184_444);
    expect(result.estimatedDate).toEqual(result.plannedDate);
    expect(result.estimatedDate).toEqual(d(2027, 3, 17));
  });

  it("1.000 ₺ fazladan harcama tarihi birkaç gün öteler", () => {
    const before = at(1_184_444).estimatedDate!;
    const after = at(1_284_444).estimatedDate!;
    // Günde ~27.400 kuruş biriktiriyorsun → 100.000 kuruş ≈ 3,7 gün
    expect(differenceInCalendarDays(after, before)).toBe(3);
  });

  it("plandan az harcarsan tarih öne gelir", () => {
    const result = at(400_000);
    expect(result.estimatedDate!.getTime()).toBeLessThan(result.plannedDate!.getTime());
  });

  it("harcama arttıkça tarih asla öne gelmez", () => {
    let previous = at(0).estimatedDate!.getTime();
    for (let spent = 50_000; spent <= 2_500_000; spent += 50_000) {
      const next = at(spent).estimatedDate!.getTime();
      expect(next).toBeGreaterThanOrEqual(previous);
      previous = next;
    }
  });

  it("bütçeyi aşınca fazla harcama gösterilir ve tarih plandan sonra", () => {
    const result = at(1_766_666);
    expect(result.overspent).toBe(400_000);
    expect(result.estimatedDate!.getTime()).toBeGreaterThan(result.plannedDate!.getTime());
  });

  it("bugünkü harcama günlük limitten tamamen düşer", () => {
    const result = buildDashboard({ ...input, spentInPeriod: 400_000, spentToday: 100_000 });
    expect(result.allowanceToday).toBe(113_333);
  });
});
