import Link from "next/link";
import { formatTL } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import type { Dashboard } from "@/lib/dashboard";

type Props = {
  goal: { name: string; price: number; saved: number };
  dashboard: Dashboard;
};

export default function GoalProgress({ goal, dashboard }: Props) {
  const { progress, estimatedDate, monthlySaving, monthsLeft, feasible } = dashboard;
  const percent = Math.round(progress * 100);

  return (
    <section className="rounded-2xl border border-gray-200 p-6 text-left">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">🎯 {goal.name}</h2>
        <Link href="/goal" className="text-sm text-gray-500 underline">Düzenle</Link>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-black" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {formatTL(goal.saved)} / {formatTL(goal.price)} · %{percent}
      </p>

      <p className="mt-4">
        {estimatedDate ? (
          <>
            Tahmini alım tarihi: <strong>{formatDate(estimatedDate)}</strong>
          </>
        ) : (
          <strong className="text-red-600">
            Bu hızla fiyat artışına yetişemiyorsun; hedefe 10 yıl içinde ulaşılamıyor.
          </strong>
        )}
      </p>
      {feasible && (
        <p className="mt-1 text-sm text-gray-500">
          Hedef için kalan {monthsLeft} ay boyunca ayda {formatTL(monthlySaving)} ayırıyorsun.
        </p>
      )}
    </section>
  );
}