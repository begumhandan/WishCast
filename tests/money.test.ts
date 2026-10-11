import { describe, it, expect } from "vitest";
import { parseTL, formatTL } from "../lib/money";

describe("parseTL (metin → kuruş)", () => {
  it.each([
    ["40000", 4_000_000],
    ["40.000", 4_000_000],
    ["1.933,33", 193_333],
    ["12,5", 1_250],
    [" 250 ", 25_000],
  ])("%s → %i kuruş", (input, expected) => {
    expect(parseTL(input)).toBe(expected);
  });

  it.each(["", "abc", "-5", "12,345"])("geçersiz girdi: '%s'", (input) => {
    expect(() => parseTL(input)).toThrow();
  });
});

it("formatTL (kuruş → ₺)", () => {
  expect(formatTL(193_333).replace(/\s/g, "")).toBe("₺1.933,33");
});