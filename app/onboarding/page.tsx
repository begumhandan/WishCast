import { Suspense } from "react";
import ProfileForm from "@/components/ProfileForm";
import { prisma } from "@/lib/db";
import { toTLInput } from "@/lib/money";
import { FIXED_EXPENSES } from "@/lib/schemas";
import { requireUserId } from "@/lib/session";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Seni tanıyalım</h1>
        <p className="mt-1 text-gray-500">
          Bütçeni hesaplayabilmemiz için gelirini, maaş gününü ve sabit giderlerini gir.
        </p>
      </div>

      <Suspense fallback={<p className="text-gray-400">Yükleniyor…</p>}>
        <ProfileFormLoader />
      </Suspense>
    </main>
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