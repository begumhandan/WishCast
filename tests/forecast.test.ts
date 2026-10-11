import { describe, it, expect } from "vitest";
import { forecastGoalDate } from "../lib/forecast";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const from = d(2026, 10, 10);

describe("forecastGoalDate", () => {
  const base = {
    price: 6_000_000,
    saved: 1_000_000,
    monthlySaving: 1_000_000,
    monthlyInflation: 0,
    from,
    currentPeriod: { daysLeft: 5, saving: 1_000_000 },
  };

  it("birikim zaten yeterliyse bugün", () => {
    expect(forecastGoalDate({ ...base, saved: 6_000_000 })).toEqual(from);
  });

  it("5 gün sonra dönem kapanır, sonra ayda 1.000.000 → yaklaşık 4 ay + 5 gün", () => {
    // 5 günde 1.000.000 → 2.000.000; kalan 4.000.000 = 4 ay = 121,76 gün → 5 + 122 = 127. gün
    expect(forecastGoalDate(base)).toEqual(d(2027, 2, 14));
  });

  it("bu dönem daha az biriktirirsen tarih ileri kayar", () => {
    const planned = forecastGoalDate(base)!;
    const worse = forecastGoalDate({ ...base, currentPeriod: { daysLeft: 5, saving: 900_000 } })!;
    expect(worse.getTime()).toBeGreaterThan(planned.getTime());
  });

  it("her ek kuruş tarihi geri iter ya da yerinde bırakır, asla öne çekmez", () => {
    let previous = forecastGoalDate(base)!.getTime();
    for (let saving = 1_000_000; saving >= 0; saving -= 50_000) {
      const next = forecastGoalDate({ ...base, currentPeriod: { daysLeft: 5, saving } })!.getTime();
      expect(next).toBeGreaterThanOrEqual(previous);
      previous = next;
    }
  });

  it("fiyat birikimden hızlı artıyorsa null", () => {
    expect(
      forecastGoalDate({ ...base, saved: 0, monthlySaving: 100_000, monthlyInflation: 0.05, currentPeriod: { daysLeft: 5, saving: 0 } }),
    ).toBeNull();
  });

  it("dönemin son günü (daysLeft = 0) hata vermez", () => {
    expect(forecastGoalDate({ ...base, currentPeriod: { daysLeft: 0, saving: 1_000_000 } })).toEqual(d(2027, 2, 9));
  });
});
