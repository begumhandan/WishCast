import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import ProfileForm from "@/components/ProfileForm";
import { prisma } from "@/lib/db";
import { toTLInput } from "@/lib/money";
import { FIXED_EXPENSES } from "@/lib/schemas";
import { requireUserId } from "@/lib/session";

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Bütçe ayarları" description="Günlük limitin bu bilgilerden hesaplanır. Sadece sen görürsün." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-surface-hover" />}>
        <ProfileFormLoader />
      </Suspense>
    </div>
  );
}

async function ProfileFormLoader() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyIncome: true, payday: true, fixedExpenses: { select: { name: true, amount: true } } },
  });

  const defaults: Record<string, string> = {
    monthlyIncome: user?.monthlyIncome ? toTLInput(user.monthlyIncome) : "",
    payday: user?.payday ? String(user.payday) : "",
  };
  for (const field of FIXED_EXPENSES) {
    const saved = user?.fixedExpenses.find((expense) => expense.name === field.label);
    defaults[field.key] = saved ? toTLInput(saved.amount) : "";
  }

  return <ProfileForm defaults={defaults} />;
}
