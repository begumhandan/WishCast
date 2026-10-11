"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
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

  redirect("/");
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

  revalidatePath("/");
  return {};
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const userId = await requireUserId();

  // userId koşulu sayesinde kimse başkasının harcamasını silemez
  await prisma.expense.deleteMany({ where: { id: expenseId, userId } });

  revalidatePath("/");
}