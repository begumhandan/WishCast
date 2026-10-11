"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signOut } from "@/lib/auth";
import { requireUserId } from "@/lib/session";
import { delayInDays } from "@/lib/closing";
import { buildDashboard } from "@/lib/dashboard";
import { getPendingClose, loadProfile } from "@/lib/dashboard-data";
import { expenseSchema, FIXED_EXPENSES, goalSchema, profileSchema, type FormState } from "@/lib/schemas";

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
  }

  const { monthlyIncome, payday, ...fixed } = parsed.data;

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { monthlyIncome, payday } }),
    prisma.fixedExpense.deleteMany({ where: { userId } }),
    prisma.fixedExpense.createMany({
      data: FIXED_EXPENSES.filter((field) => fixed[field.key] > 0).map((field) => ({
        userId,
        name: field.label,
        amount: fixed[field.key],
      })),
    }),
  ]);

  redirect("/goal");
}

export async function saveGoal(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = goalSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
  }

  const { inflationPercent, ...rest } = parsed.data;
  const data = { ...rest, monthlyInflation: inflationPercent };

  // MVP: kullanıcı başına tek hedef
  const existing = await prisma.goal.findFirst({ where: { userId }, select: { id: true } });
  if (existing) {
    await prisma.goal.update({ where: { id: existing.id }, data });
  } else {
    await prisma.goal.create({ data: { ...data, userId } });
  }

  redirect("/dashboard");
}

export async function addExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
  }

  await prisma.expense.create({
    data: {
      userId,
      amount: parsed.data.amount,
      category: parsed.data.category,
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/", "layout");

  // Harcamanın hedefe etkisini hesapla
  const profile = await loadProfile(userId);
  if (!profile) return {};

  const { savingRate } = buildDashboard({ now: new Date(), ...profile, spentInPeriod: 0 });
  const days = delayInDays(parsed.data.amount, savingRate);
  if (days === null) return {};

  return { impact: { id: Date.now(), days, goalName: profile.goal.name } };
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const userId = await requireUserId();

  // userId koşulu sayesinde kimse başkasının harcamasını silemez
  await prisma.expense.deleteMany({ where: { id: expenseId, userId } });

  revalidatePath("/", "layout");
}

export async function closePeriod(): Promise<void> {
  const userId = await requireUserId();

  const profile = await loadProfile(userId);
  if (!profile) return;

  // Tutarı formdan ALMIYORUZ; sunucuda yeniden hesaplıyoruz
  const pending = await getPendingClose(userId, profile, new Date());
  if (!pending) return;

  try {
    await prisma.$transaction([
      prisma.periodClose.create({
        data: { userId, periodStart: pending.period.start, leftover: pending.leftover },
      }),
      prisma.goal.update({
        where: { id: profile.goal.id },
        data: { saved: { increment: pending.leftover } },
      }),
    ]);
  } catch (error) {
    // P2002: benzersizlik ihlali. Dönem aynı anda iki kez kapatılmaya çalışıldı; ikincisini yok say.
    if ((error as { code?: string }).code !== "P2002") throw error;
  }

  revalidatePath("/", "layout");
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
