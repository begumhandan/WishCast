import { describe, it, expect } from "vitest";
import { delayInDays, formatDelay, isClosable, periodLeftover, previousPeriod } from "../lib/closing";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe("previousPeriod", () => {
  it("bir önceki maaş dönemini verir", () => {
    expect(previousPeriod(d(2026, 10, 20), 15)).toEqual({ start: d(2026, 9, 15), end: d(2026, 10, 14) });
  });
  it("yıl geçişi", () => {
    expect(previousPeriod(d(2027, 1, 20), 15)).toEqual({ start: d(2026, 12, 15), end: d(2027, 1, 14) });
  });
  it("maaş günü 31, mart başında önceki dönem şubat kısa", () => {
    expect(previousPeriod(d(2026, 3, 31), 31)).toEqual({ start: d(2026, 2, 28), end: d(2026, 3, 30) });
  });
});

describe("isClosable", () => {
  const period = { start: d(2026, 10, 15), end: d(2026, 11, 14) };
  it("hedef dönemden önce oluşturulduysa kapatılabilir", () => {
    expect(isClosable(period, d(2026, 10, 1))).toBe(true);
  });
  it("hedef dönem başladığı gün oluşturulduysa kapatılabilir", () => {
    expect(isClosable(period, new Date(2026, 9, 15, 18, 30))).toBe(true);
  });
  it("hedef dönemin ortasında oluşturulduysa kapatılamaz", () => {
    expect(isClosable(period, d(2026, 10, 20))).toBe(false);
  });
});

describe("periodLeftover", () => {
  it("gelirden sabit giderleri ve harcamaları düşer", () => {
    expect(periodLeftover({ income: 4_000_000, fixedTotal: 1_800_000, spent: 1_200_000 })).toBe(1_000_000);
  });
  it("eksiye düşmez", () => {
    expect(periodLeftover({ income: 4_000_000, fixedTotal: 1_800_000, spent: 3_000_000 })).toBe(0);
  });
});

describe("delayInDays", () => {
  it("harcamayı günlük birikime böler", () => {
    // Ayda 30.416,67 ₺ → günde 1.000 ₺; 2.500 ₺ harcama 2,5 gün geciktirir
    expect(delayInDays(250_000, 3_041_667)).toBeCloseTo(2.5, 3);
  });
  it("aylık birikim yoksa null", () => {
    expect(delayInDays(25_000, 0)).toBeNull();
  });
});

describe("formatDelay", () => {
  it.each([
    [0.01, "1 saat"],
    [0.5, "12 saat"],
    [1, "1 gün"],
    [2.4, "2 gün"],
    [2.6, "3 gün"],
  ])("%f → %s", (days, text) => {
    expect(formatDelay(days)).toBe(text);
  });
});