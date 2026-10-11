import Link from "next/link";
import { Suspense } from "react";
import { CalendarClock, Target, TrendingDown, Wallet } from "lucide-react";
import AddExpenseButton from "@/components/AddExpenseButton";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import DailySpendingChart from "@/components/DailySpendingChart";
import ExpenseList from "@/components/ExpenseList";
import GoalCard from "@/components/GoalCard";
import PageHeader from "@/components/PageHeader";
import PeriodCloseBanner from "@/components/PeriodCloseBanner";
import StatCard from "@/components/StatCard";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatShortDate } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { formatTL } from "@/lib/money";
import { requireUserId } from "@/lib/session";
import { buttonPrimary, card, cardHeader, cardTitle } from "@/lib/ui";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Genel bakış" description="Bu dönemin özeti ve hedefinin durumu" actions={<AddExpenseButton />} />
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const userId = await requireUserId();
  const data = await getDashboardData(userId, new Date());

  if (!data) {
    return <SetupSteps userId={userId} />;
  }

  const { dashboard, goal } = data;
  const periodDays = data.daily.length;
  const plannedDaily = periodDays > 0 ? Math.floor(dashboard.spendable / periodDays) : 0;
  const goalLeft = Math.max(0, goal.price - goal.saved);

  return (
    <div className="flex flex-col gap-6">
      {data.pendingClose && <PeriodCloseBanner period={data.pendingClose.period} leftover={data.pendingClose.leftover} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Bugün harcayabileceğin"
          value={formatTL(dashboard.allowanceToday)}
          icon={Wallet}
          tone="accent"
          hint={`${dashboard.daysLeft} gün kaldı`}
        />
        <StatCard
          label="Dönemde kalan"
          value={formatTL(dashboard.remaining)}
          icon={CalendarClock}
          tone={dashboard.remaining < 0 ? "negative" : "default"}
          hint={`${formatShortDate(dashboard.period.start)} – ${formatShortDate(dashboard.period.end)}`}
        />
        <StatCard
          label="Bu dönem harcanan"
          value={formatTL(dashboard.spentInPeriod)}
          icon={TrendingDown}
          hint={`Bütçe: ${formatTL(dashboard.spendable)}`}
        />
        <StatCard label="Hedefe kalan" value={formatTL(goalLeft)} icon={Target} hint={`%${Math.round(dashboard.progress * 100)} tamamlandı`} />
      </div>

      {!dashboard.feasible && (
        <p className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          Gelirin bu hedefi seçtiğin sürede karşılamıyor. Hedef kartındaki tarih, ayırabileceğin en fazla parayla en erken tarih.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className={`${card} lg:col-span-2`}>
          <div className={cardHeader}>
            <h2 className={cardTitle}>Günlük harcama</h2>
            <span className="hidden text-xs text-muted sm:inline">Kesikli çizgi: planlanan günlük bütçe ({formatTL(plannedDaily)})</span>
          </div>
          <div className="px-3 pb-3 pt-4">
            <DailySpendingChart data={data.daily} dailyBudget={plannedDaily} />
          </div>
        </section>

        <GoalCard goal={goal} dashboard={dashboard} />

        <section className={card}>
          <div className={cardHeader}>
            <h2 className={cardTitle}>Kategoriler</h2>
          </div>
          <CategoryBreakdown data={data.categories} />
        </section>

        <section className={`${card} lg:col-span-2`}>
          <div className={cardHeader}>
            <h2 className={cardTitle}>Son harcamalar</h2>
            <Link href="/history" className="text-xs font-medium text-muted hover:text-ink">Tümünü gör →</Link>
          </div>
          <ExpenseList expenses={data.recentExpenses} empty="Bu dönemde henüz harcama yok. Sağ üstten ilk harcamanı ekle." />
        </section>
      </div>
    </div>
  );
}

async function SetupSteps({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { monthlyIncome: true } });
  const hasProfile = Boolean(user?.monthlyIncome);

  const steps = [
    { title: "Bütçeni gir", text: "Gelirin, maaş günün ve sabit giderlerin.", href: "/onboarding", done: hasProfile },
    { title: "Hedefini belirle", text: "Ne almak istiyorsun, ne zamana kadar?", href: "/goal", done: false },
  ];

  return (
    <section className={`${card} mx-auto w-full max-w-lg`}>
      <div className={cardHeader}>
        <h2 className={cardTitle}>Başlamak için 2 adım</h2>
        <span className="text-xs text-muted">{hasProfile ? "1 / 2" : "0 / 2"}</span>
      </div>
      <ol className="divide-y divide-line">
        {steps.map((step, i) => (
          <li key={step.href} className="flex items-center gap-4 px-5 py-4">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.done ? "bg-positive-soft text-positive" : "border border-line text-muted"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted">{step.text}</p>
            </div>
            {!step.done && (
              <Link href={step.href} className={buttonPrimary}>
                Başla
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-label="Yükleniyor">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-surface-hover" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-xl bg-surface-hover lg:col-span-2" />
        <div className="h-72 rounded-xl bg-surface-hover" />
      </div>
    </div>
  );
}
