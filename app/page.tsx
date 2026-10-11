import Link from "next/link";
import { Suspense } from "react";
import AllowanceCard from "@/components/AllowanceCard";
import GoalProgress from "@/components/GoalProgress";
import QuickExpense from "@/components/QuickExpense";
import TodayExpenses from "@/components/TodayExpenses";
import { signIn, signOut } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <header className="pt-6 text-center">
        <h1 className="text-4xl font-bold">🔮 WishCast</h1>
        <p className="text-gray-500">Forecast the day you get what you want.</p>
      </header>

      <Suspense fallback={<p className="text-center text-gray-400">Yükleniyor…</p>}>
        <AuthSection />
      </Suspense>
    </main>
  );
}

async function AuthSection() {
  const session = await getSession();

  if (!session?.user?.id) {
    return (
      <form
        className="flex justify-center"
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button
          type="submit"
          className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
        >
          GitHub ile giriş yap
        </button>
      </form>
    );
  }

  const userId = session.user.id;
  const data = await getDashboardData(userId, new Date());

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-lg">Merhaba, {session.user.name} 👋</p>

      {data ? (
        <>
          <AllowanceCard dashboard={data.dashboard} />
          <QuickExpense />
          <TodayExpenses expenses={data.todayExpenses} />
          <GoalProgress goal={data.goal} dashboard={data.dashboard} />
        </>
      ) : (
        <SetupSteps userId={userId} />
      )}

      <nav className="flex justify-center gap-4 text-sm text-gray-500">
        <Link href="/onboarding" className="underline">Gelir ve giderler</Link>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" className="underline">Çıkış yap</button>
        </form>
      </nav>
    </div>
  );
}

async function SetupSteps({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { monthlyIncome: true } });
  const href = user?.monthlyIncome ? "/goal" : "/onboarding";
  const text = user?.monthlyIncome ? "Şimdi hedefini belirle" : "Başlamak için gelirini ve giderlerini gir";

  return (
    <Link
      href={href}
      className="rounded-lg bg-black px-6 py-3 text-center font-medium text-white hover:bg-gray-800"
    >
      {text} →
    </Link>
  );
}