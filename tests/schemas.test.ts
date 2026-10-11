import { describe, it, expect } from "vitest";
import { profileSchema, goalSchema } from "../lib/schemas";

const validProfile = {
  monthlyIncome: "40.000",
  payday: "15",
  rent: "15.000",
  bills: "",
  transport: "1.500,50",
  subscriptions: "",
  other: "",
};

describe("profileSchema", () => {
  it("geçerli formu kuruşa çevirir, boş giderler 0 olur", () => {
    expect(profileSchema.parse(validProfile)).toEqual({
      monthlyIncome: 4_000_000,
      payday: 15,
      rent: 1_500_000,
      bills: 0,
      transport: 150_050,
      subscriptions: 0,
      other: 0,
    });
  });

  it.each([
    ["monthlyIncome", "abc"],
    ["monthlyIncome", "0"],
    ["payday", "0"],
    ["payday", "32"],
    ["payday", "abc"],
    ["rent", "-5"],
  ])("%s = '%s' reddedilir", (field, value) => {
    const result = profileSchema.safeParse({ ...validProfile, [field]: value });
    expect(result.success).toBe(false);
  });
});

const validGoal = { name: "iPhone", price: "60.000", saved: "10.000", targetMonths: "6", inflationPercent: "2,5" };

describe("goalSchema", () => {
  it("geçerli formu dönüştürür", () => {
    expect(goalSchema.parse(validGoal)).toEqual({
      name: "iPhone",
      price: 6_000_000,
      saved: 1_000_000,
      targetMonths: 6,
      inflationPercent: 0.025,
    });
  });

  it("boş birikim ve boş enflasyon 0 olur", () => {
    const result = goalSchema.parse({ ...validGoal, saved: "", inflationPercent: "" });
    expect(result.saved).toBe(0);
    expect(result.inflationPercent).toBe(0);
  });

  it.each([
    ["name", "   "],
    ["price", "0"],
    ["targetMonths", "0"],
    ["targetMonths", "121"],
    ["inflationPercent", "abc"],
    ["inflationPercent", "80"],
  ])("%s = '%s' reddedilir", (field, value) => {
    const result = goalSchema.safeParse({ ...validGoal, [field]: value });
    expect(result.success).toBe(false);
  });
});