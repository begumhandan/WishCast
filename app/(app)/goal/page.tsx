import { Suspense } from "react";
import GoalForm from "@/components/GoalForm";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/db";
import { toTLInput } from "@/lib/money";
import { requireUserId } from "@/lib/session";

export default function GoalPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Hedef" description="Almak istediğin şeyi gir; WishCast ne zaman alabileceğini hesaplasın." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-surface-hover" />}>
        <GoalFormLoader />
      </Suspense>
    </div>
  );
}

async function GoalFormLoader() {
  const userId = await requireUserId();
  const goal = await prisma.goal.findFirst({ where: { userId } });

  const defaults: Record<string, string> = goal
    ? {
        name: goal.name,
        price: toTLInput(goal.price),
        saved: goal.saved > 0 ? toTLInput(goal.saved) : "",
        targetMonths: String(goal.targetMonths),
        inflationPercent: goal.monthlyInflation > 0 ? String(goal.monthlyInflation * 100).replace(".", ",") : "",
      }
    : {};

  return <GoalForm defaults={defaults} />;
}
