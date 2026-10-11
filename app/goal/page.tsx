import { Suspense } from "react";
import GoalForm from "@/components/GoalForm";
import { prisma } from "@/lib/db";
import { toTLInput } from "@/lib/money";
import { requireUserId } from "@/lib/session";

export default function GoalPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Hedefin ne? 🎯</h1>
        <p className="mt-1 text-gray-500">
          Almak istediğin şeyi ve ne zamana kadar almak istediğini yaz, gerisini WishCast hesaplasın.
        </p>
      </div>

      <Suspense fallback={<p className="text-gray-400">Yükleniyor…</p>}>
        <GoalFormLoader />
      </Suspense>
    </main>
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